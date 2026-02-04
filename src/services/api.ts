import { supabase } from '../lib/supabase';
import type { Order, Property, User, ServiceType, OrderStatus, Message } from '../types';
import { defaultServices } from '../stores/servicesStore';

const transformOrder = (row: any): Order => ({
    id: row.id,
    propertyId: row.property_id || '',
    propertyAddress: row.properties?.address || '',
    services: row.order_services?.map((s: any) => s.service_name as ServiceType) || [],
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as 'pending' | 'confirmed' | 'paid',
    shootDate: row.shoot_date,
    agentName: row.profiles?.full_name || 'Unknown Agent',
    createdAt: row.created_at,
    totalAmount: row.order_services?.reduce((sum: number, s: any) => sum + (s.price || 0), 0) || 0,
    deliverables:
        row.assets?.map((a: any) => ({
            id: a.id,
            type: a.type,
            label: a.name,
            url: a.url,
            serviceId: a.service_id,
            isWebOptimized: true,
            isPrintOptimized: false,
        })) || [],
});

async function requireUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('Not authenticated');
    return data.user;
}

export const api = {
    // =========================
    // User Management
    // =========================
    getCurrentUser: async (): Promise<User | null> => {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return {
            id: user.id,
            name: profile?.full_name || user.email || 'User',
            email: user.email || '',
            role: (profile?.role as any) || 'agent',
            brokerage: profile?.brokerage_name,
            avatar: profile?.avatar_url,
        };
    },

    updateUser: async (updates: Partial<User>) => {
        const user = await requireUser();

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: updates.name,
                brokerage_name: updates.brokerage,
                avatar_url: updates.avatar,
            })
            .eq('id', user.id);

        if (error) throw error;
        return { ...updates, id: user.id } as User;
    },

    // =========================
    // Properties (ONLY current user)
    // =========================
    getProperties: async (): Promise<Property[]> => {
        const user = await requireUser();

        // IMPORTANT: only show properties owned by current user
        // (your schema has BOTH user_id and agent_id, so support either)
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .or(`user_id.eq.${user.id},agent_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties:', error);
            return [];
        }

        return (data ?? []).map((p: any) => ({
            id: p.id,
            address: p.address,
            thumbnail: p.thumbnail_url || '',
            status: p.status,
            beds: p.beds,
            baths: Number(p.baths),
            sqft: p.sqft,
            price: Number(p.price),
            mls: p.mls_number,
        }));
    },

    getPropertyById: async (id: string): Promise<Property | undefined> => {
        const user = await requireUser();

        // IMPORTANT: protect single fetch too (must belong to user)
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .or(`user_id.eq.${user.id},agent_id.eq.${user.id}`)
            .single();

        if (error) return undefined;

        return {
            id: data.id,
            address: data.address,
            thumbnail: data.thumbnail_url || '',
            status: data.status,
            beds: data.beds,
            baths: Number(data.baths),
            sqft: data.sqft,
            price: Number(data.price),
            mls: data.mls_number,
        };
    },

    // IMPORTANT: attach property to CURRENT user (not passed-in user)
    createProperty: async (property: Omit<Property, 'id'>) => {
        const user = await requireUser();
        const ownerId = user.id;

        const { data, error } = await supabase
            .from('properties')
            .insert({
                address: property.address,
                thumbnail_url: property.thumbnail,
                status: property.status,
                beds: property.beds,
                baths: property.baths,
                sqft: property.sqft,
                price: property.price,
                mls_number: property.mls ?? null,

                // ✅ attach to current logged-in user
                user_id: ownerId,
                agent_id: ownerId,
            })
            .select()
            .single();

        if (error) throw error;

        return {
            ...property,
            id: data.id,
        } as Property;
    },

    updateProperty: async (id: string, property: Partial<Property>) => {
        // Optional: you can also enforce ownership here by adding `.or(...)` like getPropertyById,
        // but ideally RLS handles it.

        const updates: any = {};
        if (property.address !== undefined) updates.address = property.address;
        if (property.thumbnail !== undefined) updates.thumbnail_url = property.thumbnail;
        if (property.status !== undefined) updates.status = property.status;
        if (property.beds !== undefined) updates.beds = property.beds;
        if (property.baths !== undefined) updates.baths = property.baths;
        if (property.sqft !== undefined) updates.sqft = property.sqft;
        if (property.price !== undefined) updates.price = property.price;
        if (property.mls !== undefined) updates.mls_number = property.mls ?? null;

        const { error } = await supabase.from('properties').update(updates).eq('id', id);
        if (error) throw error;

        return api.getPropertyById(id);
    },

    deleteProperty: async (id: string) => {
        const { error } = await supabase.from('properties').delete().eq('id', id);
        return !error;
    },

    // =========================
    // Orders
    // =========================
    getOrders: async (): Promise<Order[]> => {
        const user = await requireUser();

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role?.trim().toLowerCase();
        const isAdmin = role === 'admin' || role === 'upca_admin' || user.email === 'admin@upca.ca';

        let query = supabase
            .from('orders')
            .select(
                `
          *,
          properties (address),
           profiles:agent_id (full_name),
           order_services (service_name, price),
          assets (*)
        `
            );

        // If NOT admin, restrict to own orders
        if (!isAdmin) {
            query = query.eq('agent_id', user.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return (data ?? []).map(transformOrder);
    },

    getOrderById: async (id: string): Promise<Order | undefined> => {
        const user = await requireUser();

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role?.trim().toLowerCase();
        const isAdmin = role === 'admin' || role === 'upca_admin' || user.email === 'admin@upca.ca';

        let query = supabase
            .from('orders')
            .select(
                `
          *,
          properties (address),
           profiles:agent_id (full_name),
           order_services (service_name, price),
          assets (*)
        `
            )
            .eq('id', id);

        // If NOT admin, restrict to own orders
        if (!isAdmin) {
            query = query.eq('agent_id', user.id);
        }

        const { data, error } = await query.single();

        if (error) return undefined;
        return transformOrder(data);
    },

    // ✅ SUPER IMPORTANT: agent_id MUST be current logged-in user
    createOrder: async (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'agentName' | 'paymentStatus'> & { paymentStatus?: 'pending' | 'paid' }) => {
        const user = await requireUser();
        const userId = user.id;

        // 1) Create Order (RLS usually checks agent_id = auth.uid())
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                property_id: order.propertyId,
                status: 'Scheduled',
                shoot_date: order.shootDate,
                agent_id: userId, // ✅ MUST BE current user
                payment_status: order.paymentStatus || 'pending',
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2) Add Services
        if (order.services && order.services.length > 0) {
            const services = order.services.map((s) => {
                const price = defaultServices.find(ds => ds.id === s)?.basePrice || 0;
                return {
                    order_id: orderData.id,
                    service_name: s,
                    price: price
                };
            });

            const { error: servicesError } = await supabase.from('order_services').insert(services);
            if (servicesError) throw servicesError;
        }

        const newOrder = await api.getOrderById(orderData.id);
        if (!newOrder) throw new Error('Failed to retrieve created order');

        return newOrder;
    },

    updateOrderStatus: async (id: string, status: OrderStatus) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', id);
        if (error) throw error;
    },

    updatePaymentStatus: async (id: string, status: string) => {
        const { error } = await supabase.from('orders').update({ payment_status: status }).eq('id', id);
        if (error) throw error;
    },

    // Invoices (Mock)
    getInvoices: async () => [],

    // =========================
    // Payments (Mock)
    // =========================
    getPaymentMethods: async () => {
        // In a real app, this would fetch saved cards from Stripe via your backend
        // const { data } = await supabase.from('payment_methods').select('*');
        return [];
    },

    chargePaymentMethod: async (paymentMethodId: string, amount: number) => {
        // Log to satisfy linter and for debugging
        console.log(`Processing payment: ${paymentMethodId} for $${amount}`);

        await new Promise(resolve => setTimeout(resolve, 1500));
        // Mock success
        return { success: true, transactionId: `txn_${Date.now()}` };
    },

    // =========================
    // Messages
    // =========================
    getMessagesByOrder: async (orderId: string): Promise<Message[]> => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, profiles:sender_id(full_name, role)')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (error) return [];

        return (data ?? []).map((m: any) => ({
            id: m.id,
            orderId: m.order_id,
            senderId: m.sender_id,
            senderName: m.profiles?.full_name || 'User',
            content: m.content,
            timestamp: m.created_at,
            isAdmin: m.profiles?.role === 'admin' || m.profiles?.role === 'upca_admin',
        }));
    },

    sendMessage: async (content: string, orderId?: string, recipientId?: string) => {
        const user = await requireUser();
        const { data, error } = await supabase
            .from('messages')
            .insert({
                order_id: orderId || null,
                sender_id: user.id,
                recipient_id: recipientId || null,
                content: content,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    getAllConversations: async () => {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                profiles:sender_id (id, full_name, role, brokerage_name, avatar_url)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by user/order to create unique conversations
        const conversations: any[] = [];
        const seen = new Set();

        data?.forEach((m: any) => {
            const key = `${m.sender_id}-${m.order_id || 'general'}`;
            if (!seen.has(key)) {
                seen.add(key);
                conversations.push({
                    userId: m.sender_id,
                    userName: m.profiles?.full_name || 'User',
                    userRole: m.profiles?.role,
                    lastMessage: m.content,
                    lastMessageTime: m.created_at,
                    orderId: m.order_id,
                    avatar: m.profiles?.avatar_url,
                });
            }
        });

        return conversations;
    },

    getMessagesByUser: async (userId: string, orderId?: string): Promise<Message[]> => {
        let query = supabase
            .from('messages')
            .select('*, profiles:sender_id(full_name, role)');

        if (orderId) {
            query = query.eq('order_id', orderId);
        } else {
            // General chat: show messages sent by the user OR received by the user
            query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).is('order_id', null);
        }

        const { data, error } = await query.order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }

        return (data ?? []).map((m: any) => ({
            id: m.id,
            orderId: m.order_id,
            senderId: m.sender_id,
            senderName: m.profiles?.full_name || 'User',
            content: m.content,
            timestamp: m.created_at,
            isAdmin: m.profiles?.role === 'admin' || m.profiles?.role === 'upca_admin',
        }));
    },

    addAsset: async (orderId: string, asset: any) => {
        const { error } = await supabase.from('assets').insert({
            order_id: orderId,
            type: asset.type,
            name: asset.name,
            url: asset.url,
            service_id: asset.serviceId,
        });
        if (error) throw error;
    },

    deleteAsset: async (assetId: string) => {
        const { error } = await supabase.from('assets').delete().eq('id', assetId);
        if (error) throw error;
    },
};
