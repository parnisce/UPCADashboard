import type { Order, Property, User } from '../types';

const MOCK_PROPERTIES: Property[] = [
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

const MOCK_ORDERS: Order[] = [
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
        ]
    },
    {
        id: 'ord-2',
        propertyId: 'prop-2',
        propertyAddress: '456 Modern Way, Oakville, ON',
        services: ['Real Estate Photography', '360/Virtual Tours'],
        status: 'Scheduled',
        shootDate: '2026-01-20',
        agentName: 'John Agent',
        createdAt: '2026-01-10',
    }
];

const MOCK_USER: User = {
    id: 'u-1',
    name: 'John Agent',
    email: 'john@upca.ca',
    role: 'agent',
    brokerage: 'Elite Realty Toronto',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

export const api = {
    getCurrentUser: async () => MOCK_USER,
    getProperties: async () => MOCK_PROPERTIES,
    getPropertyById: async (id: string) => MOCK_PROPERTIES.find(p => p.id === id),
    getOrders: async () => MOCK_ORDERS,
    getOrderById: async (id: string) => MOCK_ORDERS.find(o => o.id === id),
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
