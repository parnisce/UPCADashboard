export type UserRole = 'agent' | 'brokerage_admin' | 'upca_admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    brokerage?: string;
    avatar?: string;
}

export type ServiceType =
    | 'Real Estate Photography'
    | 'Property Video Tours'
    | '360/Virtual Tours'
    | 'Drone Photos & Films'
    | 'Property Microsites & Agent Websites'
    | 'Full-Service Real Estate Marketing';

export type OrderStatus = 'Draft' | 'Scheduled' | 'In Progress' | 'Editing' | 'Delivered' | 'Archived';

export interface Property {
    id: string;
    address: string;
    thumbnail: string;
    status: 'Active listing' | 'Coming soon' | 'Sold';
    beds: number;
    baths: number;
    sqft: number;
    price: number;
    mls: string;
}

export interface Order {
    id: string;
    propertyId: string;
    propertyAddress: string;
    services: ServiceType[];
    status: OrderStatus;
    shootDate: string;
    agentName: string;
    createdAt: string;
    deliverables?: Deliverable[];
}

export interface Deliverable {
    id: string;
    type: 'photo' | 'video' | '360' | 'drone' | 'microsite';
    label: string;
    url: string;
    isWebOptimized: boolean;
    isPrintOptimized: boolean;
}

export interface Invoice {
    id: string;
    orderId: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Due' | 'Overdue';
    services: { name: ServiceType; price: number }[];
}

export interface Message {
    id: string;
    orderId?: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    isAdmin: boolean;
}
