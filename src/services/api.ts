import { supabase } from '../lib/supabase';
import type { Order, Property, User, ServiceType, OrderStatus } from '../types';

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

function mapPropertyRow(p: any): Property {
    return {
        id: p.id,
        address: p.address,
        thumbnail: p.thumbnail_url || '',
        status: p.status,
        beds: p.beds,
        baths: Number(p.baths),
        sqft: p.sqft,
        price: Number(p.price),
        mls: p.mls_number,
    };
}

export const api = {
    // User Management
    getCurrentUser: async (): Promise<User | null> => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
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
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) throw new Error('Not authenticated');

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                full_name: updates.name,
                brokerage_name: updates.brokerage,
                avatar_url: updates.avatar,
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        return { ...updates, id: user.id } as User;
    },

    // =========================
    // Properties (USER SCOPED)
    // =========================

    // ✅ Only return properties owned by the current user
    getProperties: async (): Promise<Property[]> => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return [];

        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('agent_id', user.id) // ✅ IMPORTANT
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties:', error);
            return [];
        }

        return (data ?? []).map(mapPropertyRow);
    },

    // ✅ Only allow reading a property if it belongs to the user
    getPropertyById: async (id: string): Promise<Property | undefined> => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return undefined;

        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .eq('agent_id', user.id) // ✅ IMPORTANT
            .single();

        if (error) return undefined;
        return mapPropertyRow(data);
    },

    // ✅ Create property tied to the logged in user
    // NOTE: No need to pass user_id from the page.
    createProperty: async (property: Omit<Property, 'id'>) => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');

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

                // ✅ owner columns (your schema has both)
                agent_id: ownerId,
                user_id: ownerId,
            })
            .select()
            .single();

        if (error) throw error;

        return {
            ...property,
            id: data.id,
        } as Property;
    },

    // ✅ Only update property if it belongs to the user
    updateProperty: async (id: string, property: Partial<Property>) => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');

        const updates: any = {};
        if (property.address !== undefined) updates.address = property.address;
        if (property.thumbnail !== undefined) updates.thumbnail_url = property.thumbnail;
        if (property.status !== undefined) updates.status = property.status;
        if (property.beds !== undefined) updates.beds = property.beds;
        if (property.baths !== undefined) updates.baths = property.baths;
        if (property.sqft !== undefined) updates.sqft = property.sqft;
        if (property.price !== undefined) updates.price = property.price;
        if (property.mls !== undefined) updates.mls_number = property.mls;

        const { error } = await supabase
            .from('properties')
            .update(updates)
            .eq('id', id)
            .eq('agent_id', user.id); // ✅ IMPORTANT

        if (error) throw error;

        return api.getPropertyById(id);
    },

    // ✅ Only delete property if it belongs to the user
    deleteProperty: async (id: string) => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id)
            .eq('agent_id', user.id); // ✅ IMPORTANT

        return !error;
    },

    // =========================
    // Orders
    // =========================

    getOrders: async (): Promise<Order[]> => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        properties (address),
        profiles:agent_id (full_name),
        order_services (service_name),
        assets (*)
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return (data ?? []).map(transformOrder);
    },

    getOrderById: async (id: string): Promise<Order | undefined> => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        properties (address),
        profiles:agent_id (full_name),
        order_services (service_name),
        assets (*)
      `)
            .eq('id', id)
            .single();

        if (error) return undefined;
        return transformOrder(data);
    },

    createOrder: async (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'agentName'>) => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                property_id: order.propertyId,
                status: 'Scheduled',
                shoot_date: order.shootDate,
                agent_id: user?.id,
                payment_status: 'pending',
            })
            .select()
            .single();

        if (orderError) throw orderError;

        if (order.services && order.services.length > 0) {
            const services = order.services.map((s) => ({
                order_id: orderData.id,
                service_name: s,
            }));
            await supabase.from('order_services').insert(services);
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

    // Invoices (Mock for now)
    getInvoices: async () => [],

    // Messages
    getMessagesByOrder: async (orderId: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, profiles:sender_id(full_name)')
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
            isAdmin: false,
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
