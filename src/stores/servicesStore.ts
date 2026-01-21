import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ServiceType, OrderStatus } from '../types';

export interface ServicePricing {
    id: ServiceType;
    name: ServiceType;
    basePrice: number;
    description: string;
    features: string[];
    isActive: boolean;
    icon?: string;
}

interface ServicesStore {
    services: ServicePricing[];
    setServices: (services: ServicePricing[]) => void;
    updateService: (id: ServiceType, updates: Partial<ServicePricing>) => void;
    getActiveServices: () => ServicePricing[];
}

// Default services
const defaultServices: ServicePricing[] = [
    {
        id: 'Real Estate Photography',
        name: 'Real Estate Photography',
        basePrice: 250,
        description: 'Professional property photography with HDR processing',
        features: ['25-35 HDR Photos', 'Same-day turnaround', 'Web & print optimized'],
        isActive: true,
        icon: 'Camera'
    },
    {
        id: 'Property Video Tours',
        name: 'Property Video Tours',
        basePrice: 350,
        description: 'Cinematic walkthrough videos with music',
        features: ['2-3 minute video', 'Professional editing', 'Music licensing included'],
        isActive: true,
        icon: 'Video'
    },
    {
        id: '360 / Virtual Tours',
        name: '360 / Virtual Tours',
        basePrice: 400,
        description: 'Interactive 360° virtual tour experience',
        features: ['Matterport 3D tour', 'Floor plan included', 'Unlimited hosting'],
        isActive: true,
        icon: 'Box'
    },
    {
        id: 'Drone Photos & Films',
        name: 'Drone Photos & Films',
        basePrice: 300,
        description: 'Aerial photography and videography',
        features: ['10-15 aerial photos', '1-minute aerial video', 'Weather permitting'],
        isActive: true,
        icon: 'Plane'
    },
    {
        id: 'Property Microsites & Agent Websites',
        name: 'Property Microsites & Agent Websites',
        basePrice: 500,
        description: 'Custom property website with all media',
        features: ['Custom domain', 'All media integrated', 'Lead capture forms'],
        isActive: true,
        icon: 'Globe'
    },
    {
        id: 'Full-Service Real Estate Marketing',
        name: 'Full-Service Real Estate Marketing',
        basePrice: 1200,
        description: 'Complete marketing package for luxury properties',
        features: ['All services included', 'Social media content', 'Print materials'],
        isActive: true,
        icon: 'ShoppingCart'
    }
];

export const useServicesStore = create<ServicesStore>()(
    persist(
        (set, get) => ({
            services: defaultServices,
            setServices: (services) => set({ services }),
            updateService: (id, updates) => set((state) => ({
                services: state.services.map(service =>
                    service.id === id ? { ...service, ...updates } : service
                )
            })),
            getActiveServices: () => get().services.filter(s => s.isActive)
        }),
        {
            name: 'upca-services-storage'
        }
    )
);

// Order Status Store for real-time updates
interface OrderStatusUpdate {
    orderId: string;
    status: OrderStatus;
    updatedAt: string;
}

interface OrderStatusStore {
    statusUpdates: Record<string, OrderStatusUpdate>;
    paymentUpdates: Record<string, 'pending' | 'confirmed' | 'paid'>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    updatePaymentStatus: (orderId: string, status: 'pending' | 'confirmed' | 'paid') => void;
    getOrderStatus: (orderId: string) => OrderStatus | null;
    getPaymentStatus: (orderId: string) => 'pending' | 'confirmed' | 'paid' | null;
}

export const useOrderStatusStore = create<OrderStatusStore>()(
    persist(
        (set, get) => ({
            statusUpdates: {},
            paymentUpdates: {},
            updateOrderStatus: (orderId, status) => set((state) => ({
                statusUpdates: {
                    ...state.statusUpdates,
                    [orderId]: {
                        orderId,
                        status,
                        updatedAt: new Date().toISOString()
                    }
                }
            })),
            updatePaymentStatus: (orderId, status) => set((state) => ({
                paymentUpdates: {
                    ...state.paymentUpdates,
                    [orderId]: status
                }
            })),
            getOrderStatus: (orderId) => {
                const update = get().statusUpdates[orderId];
                return update ? update.status : null;
            },
            getPaymentStatus: (orderId) => get().paymentUpdates[orderId] || null
        }),
        {
            name: 'upca-order-status-storage'
        }
    )
);

// Asset Store for uploading and managing deliverables
export interface Asset {
    id: string;
    type: 'photo' | 'video' | 'link' | 'other';
    name: string;
    url: string;
    serviceId: string; // Creates link to the specific service ordered
}

interface AssetsStore {
    assets: Record<string, Asset[]>; // Keyed by orderId
    addAsset: (orderId: string, asset: Asset) => void;
    removeAsset: (orderId: string, assetId: string) => void;
    getOrderAssets: (orderId: string) => Asset[];
}

export const useAssetsStore = create<AssetsStore>()(
    persist(
        (set, get) => ({
            assets: {},
            addAsset: (orderId, asset) => set((state) => ({
                assets: {
                    ...state.assets,
                    [orderId]: [...(state.assets[orderId] || []), asset]
                }
            })),
            removeAsset: (orderId, assetId) => set((state) => ({
                assets: {
                    ...state.assets,
                    [orderId]: (state.assets[orderId] || []).filter(a => a.id !== assetId)
                }
            })),
            getOrderAssets: (orderId) => get().assets[orderId] || []
        }),
        {
            name: 'upca-assets-storage'
        }
    )
);
