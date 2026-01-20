import type { Order, Property, User } from '../types';

const STORAGE_KEYS = {
    PROPERTIES: 'upca_properties',
    ORDERS: 'upca_orders',
    USER: 'upca_user',
};

const INITIAL_PROPERTIES: Property[] = [
    {
        id: 'prop-1',
        address: '123 Luxury Ave, Toronto, ON',
        thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
        status: 'Active listing',
        beds: 4,
        baths: 3,
        sqft: 2500,
        price: 1250000,
        mls: 'C1234567',
    },
    {
        id: 'prop-2',
        address: '456 Modern Way, Oakville, ON',
        thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&w=400&q=80',
        status: 'Coming soon',
        beds: 3,
        baths: 2,
        sqft: 1800,
        price: 899000,
        mls: 'C7654321',
    }
];

const INITIAL_ORDERS: Order[] = [
    {
        id: 'ord-1',
        propertyId: 'prop-1',
        propertyAddress: '123 Luxury Ave, Toronto, ON',
        services: ['Real Estate Photography', 'Property Video Tours', 'Drone Photos & Films'],
        status: 'Delivered',
        shootDate: '2025-10-15',
        agentName: 'John Agent',
        createdAt: '2025-10-10',
        deliverables: [
            { id: 'd-1', type: 'photo', label: 'HDR Photography Package', url: '#', isWebOptimized: true, isPrintOptimized: true },
            { id: 'd-2', type: 'video', label: 'Cinematic Video Tour', url: '#', isWebOptimized: true, isPrintOptimized: false },
            { id: 'd-3', type: 'drone', label: 'Aerial Photos & B-Roll', url: '#', isWebOptimized: true, isPrintOptimized: true },
            { id: 'd-4', type: 'microsite', label: 'Property Microsite', url: 'https://123luxuryave.upca.ca', isWebOptimized: true, isPrintOptimized: false },
        ]
    },
    {
        id: 'ord-2',
        propertyId: 'prop-2',
        propertyAddress: '456 Modern Way, Oakville, ON',
        services: ['Real Estate Photography', '360 / Virtual Tours'],
        status: 'Scheduled',
        shootDate: '2026-01-20',
        agentName: 'John Agent',
        createdAt: '2026-01-10',
        deliverables: [
            { id: 'd-5', type: 'photo', label: 'HDR Photography Package', url: '#', isWebOptimized: true, isPrintOptimized: true },
            { id: 'd-6', type: '360', label: 'Matterport 3D Tour', url: '#', isWebOptimized: true, isPrintOptimized: false },
        ]
    }
];

const INITIAL_USER: User = {
    id: 'u-1',
    name: 'John Agent',
    email: 'john@upca.ca',
    role: 'agent',
    brokerage: 'Elite Realty Toronto',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

// Helper to get from localStorage
const getStoredData = <T>(key: string, initialData: T[]): T[] => {
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(stored);
};

// Helper to save to localStorage
const setStoredData = <T>(key: string, data: T[]): void => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Helper to get from localStorage (single item)
const getStoredItem = <T>(key: string, initialData: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(stored);
};

export const api = {
    getCurrentUser: async () => getStoredItem(STORAGE_KEYS.USER, INITIAL_USER),

    updateUser: async (user: Partial<User>) => {
        const currentUser = getStoredItem(STORAGE_KEYS.USER, INITIAL_USER);
        const updated = { ...currentUser, ...user };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
        return updated;
    },

    getProperties: async () => getStoredData(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES),

    getPropertyById: async (id: string) => {
        const props = getStoredData<Property>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
        return props.find(p => p.id === id);
    },

    createProperty: async (property: Omit<Property, 'id'>) => {
        const props = getStoredData<Property>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
        const newProperty = {
            ...property,
            id: `prop-${Math.random().toString(36).substr(2, 9)}`,
        };
        setStoredData(STORAGE_KEYS.PROPERTIES, [...props, newProperty]);
        return newProperty;
    },

    updateProperty: async (id: string, property: Partial<Property>) => {
        const props = getStoredData<Property>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
        const updatedProps = props.map(p => p.id === id ? { ...p, ...property } : p);
        setStoredData(STORAGE_KEYS.PROPERTIES, updatedProps);
        return updatedProps.find(p => p.id === id);
    },

    deleteProperty: async (id: string) => {
        const props = getStoredData<Property>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
        const filtered = props.filter(p => p.id !== id);
        setStoredData(STORAGE_KEYS.PROPERTIES, filtered);
        return true;
    },

    getOrders: async () => getStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),

    getOrderById: async (id: string) => {
        const orders = getStoredData<Order>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
        return orders.find(o => o.id === id);
    },

    createOrder: async (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'agentName'>) => {
        const orders = getStoredData<Order>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
        const user = getStoredItem(STORAGE_KEYS.USER, INITIAL_USER);
        const newOrder: Order = {
            ...order,
            id: `ord-${Math.random().toString(36).substr(2, 9)}`,
            status: 'Scheduled',
            agentName: user.name,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setStoredData(STORAGE_KEYS.ORDERS, [...orders, newOrder]);
        return newOrder;
    },

    getInvoices: async () => [
        {
            id: 'inv-1',
            orderId: 'ord-1',
            date: '2025-10-16',
            amount: 450.00,
            status: 'Paid' as const,
            services: [{ name: 'Real Estate Photography' as const, price: 450.00 }]
        }
    ],

    getMessagesByOrder: async (orderId: string) => [
        {
            id: 'm-1',
            orderId,
            senderId: 'upca-1',
            senderName: 'UPCA Team',
            content: 'Your photos are now ready for review!',
            timestamp: '2025-10-15T14:30:00Z',
            isAdmin: true,
        }
    ]
};
