import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    CheckCircle2,
    Download,
    ExternalLink,
    Image as ImageIcon,
    Video,
    Box,
    Plane,
    Globe,
    FileText,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { api } from '../services/api';
import type { Order, Property, Deliverable, Message } from '../types';
import { cn } from '../services/utils';
import { useOrderStatusStore } from '../stores/servicesStore';

export const OrderDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    const { getOrderStatus } = useOrderStatusStore();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) return;
            try {
                const orderData = await api.getOrderById(id);
                if (orderData) {
                    // Check if there's an updated status from admin panel
                    const updatedStatus = getOrderStatus(id);
                    if (updatedStatus) {
                        orderData.status = updatedStatus;
                    }
                    setOrder(orderData);
                    const propData = await api.getPropertyById(orderData.propertyId);
                    if (propData) setProperty(propData);
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, getOrderStatus]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-upca-blue" />
                <p className="text-gray-500 font-medium">Loading project details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
                <button
                    onClick={() => navigate('/orders')}
                    className="mt-4 text-upca-blue font-bold hover:underline"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const statusSteps = [
        { status: 'Scheduled', label: 'Shoot Booked', icon: Calendar },
        { status: 'In Progress', label: 'On Site', icon: MapPin },
        { status: 'Editing', label: 'Post-Production', icon: Clock },
        { status: 'Delivered', label: 'Media Ready', icon: CheckCircle2 },
    ];

    const getStepIndex = (status: string) => {
        if (status === 'Archived') return 3; // Treat as fully completed
        if (status === 'Draft') return -1; // Before first step
        return statusSteps.findIndex(s => s.status === status);
    };

    const currentStepIndex = getStepIndex(order.status);

    const getAssetIcon = (type: Deliverable['type']) => {
        switch (type) {
            case 'photo': return <ImageIcon className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case '360': return <Box className="w-5 h-5" />;
            case 'drone': return <Plane className="w-5 h-5" />;
            case 'microsite': return <Globe className="w-5 h-5" />;
            default: return <ImageIcon className="w-5 h-5" />;
        }
    };

    return (
        <div className="max-w-screen-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-upca-blue transition-colors font-medium group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Projects
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                            Project: {order.propertyAddress}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                                Order ID: {order.id}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500 font-medium">Created on {order.createdAt}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsMessageModalOpen(true)}
                        className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <MessageSquare className="w-5 h-5" />
                        Messages
                    </button>
                    <button className="px-6 py-3 bg-upca-blue text-white rounded-xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 transition-all flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Download All
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Property & Status */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Tracker */}
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8">
                            <div className={cn(
                                "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest",
                                (order.status === 'Delivered' || order.status === 'Archived') ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    order.status === 'Draft' ? "bg-gray-100 text-gray-500 border border-gray-200" :
                                        order.status === 'Scheduled' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                            "bg-orange-50 text-orange-600 border border-orange-100"
                            )}>
                                {order.status}
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-8">Project Timeline</h2>

                        <div className="relative flex justify-between items-start">
                            {/* Track Link Line */}
                            <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 -z-0" />
                            <div
                                className="absolute top-6 left-0 h-1 bg-upca-blue transition-all duration-1000 -z-0"
                                style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                            />

                            {statusSteps.map((step, idx) => {
                                const Icon = step.icon;
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;

                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center group">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 border-white",
                                            isCompleted ? "bg-upca-blue text-white shadow-lg shadow-upca-blue/30" : "bg-gray-100 text-gray-400"
                                        )}>
                                            <Icon className={cn("w-6 h-6", isCurrent && "animate-pulse")} />
                                        </div>
                                        <div className="mt-4 text-center">
                                            <p className={cn(
                                                "text-xs font-bold uppercase tracking-tight",
                                                isCompleted ? "text-gray-900" : "text-gray-400"
                                            )}>{step.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Property Image & Details */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group">
                        <div className="relative h-64 overflow-hidden">
                            <img
                                src={property?.thumbnail || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-8 text-white">
                                <h3 className="text-2xl font-bold">{order.propertyAddress}</h3>
                                <p className="text-white/80 font-medium">Shoot Date: {order.shootDate}</p>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-gray-400">Services Ordered</p>
                                <p className="font-bold text-gray-900 mt-1">{order.services.length} items</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-gray-400">Media Files</p>
                                <p className="font-bold text-gray-900 mt-1">{order.deliverables?.length || 0} files</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-gray-400">Total (Inc. Tax)</p>
                                <p className="font-bold text-gray-900 mt-1">${((order.totalAmount || 0) * 1.13).toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-gray-400">Agent</p>
                                <p className="font-bold text-gray-900 mt-1">{order.agentName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Deliverables */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Deliverables
                        <span className="text-xs bg-upca-blue/10 text-upca-blue px-2 py-0.5 rounded-full">
                            {order.deliverables?.length || 0}
                        </span>
                    </h2>

                    {order.deliverables && order.deliverables.length > 0 ? (
                        <div className="space-y-3">
                            {order.deliverables.map((asset) => (
                                <div key={asset.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-upca-blue/30 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-upca-blue/10 group-hover:text-upca-blue transition-colors">
                                            {getAssetIcon(asset.type)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{asset.label}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{asset.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-400 hover:text-upca-blue transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <a href={asset.url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-upca-blue transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 bg-white rounded-3xl border border-gray-100 border-dashed text-center">
                            <Clock className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose">
                                We are still<br />processing media
                            </p>
                        </div>
                    )}

                    <div className="p-6 bg-subtle-gradient rounded-3xl border border-upca-blue/10">
                        <h3 className="font-bold text-gray-900 mb-2">Order Documents</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center justify-between p-3 bg-white/50 rounded-xl text-sm font-medium text-gray-600 hover:bg-white transition-colors">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-upca-blue" />
                                    Invoice-1234.pdf
                                </div>
                                <Download className="w-4 h-4" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 bg-white/50 rounded-xl text-sm font-medium text-gray-600 hover:bg-white transition-colors">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-upca-blue" />
                                    Property-Flyer.pdf
                                </div>
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messaging Dialog */}
            <OrderMessagesModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                orderId={order.id}
                propertyAddress={order.propertyAddress}
            />
        </div>
    );
};

interface OrderMessagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    propertyAddress: string;
}

const OrderMessagesModal: React.FC<OrderMessagesModalProps> = ({ isOpen, onClose, orderId, propertyAddress }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const fetchMessages = async () => {
            const data = await api.getMessagesByOrder(orderId);
            setMessages(data);
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [isOpen, orderId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;
        setIsSending(true);
        try {
            await api.sendMessage(newMessage, orderId);
            setNewMessage('');
            const data = await api.getMessagesByOrder(orderId);
            setMessages(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-300">
                <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">Project Conversation</h3>
                        <p className="text-xs text-gray-400">{propertyAddress}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors font-bold">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                    {messages.length === 0 && (
                        <div className="text-center py-10">
                            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
                        </div>
                    )}
                    {messages.map((m) => (
                        <div key={m.id} className={cn("flex flex-col", m.isAdmin ? "items-start" : "items-end")}>
                            <div className={cn(
                                "max-w-[80%] p-4 rounded-2xl text-sm shadow-sm",
                                m.isAdmin ? "bg-white text-gray-800 rounded-tl-none border border-gray-100" : "bg-upca-blue text-white rounded-tr-none"
                            )}>
                                {m.content}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                {m.senderName} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message about this project..."
                        className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-upca-blue/20 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="px-6 py-3 bg-upca-blue text-white rounded-xl font-bold hover:bg-upca-blue/90 disabled:opacity-50 transition-all flex items-center justify-center min-w-[100px]"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};
