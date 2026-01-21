import React, { useState, useEffect } from 'react';
import {
    Download,
    Image as ImageIcon,
    Video,
    Box,
    Plane,
    Globe,
    Search
} from 'lucide-react';
import { api } from '../services/api';
import type { Order } from '../types';
import { cn } from '../services/utils';
import { useAssetsStore, useOrderStatusStore } from '../stores/servicesStore';

export const DeliverablesPage: React.FC = () => {
    const { getOrderAssets } = useAssetsStore();
    const { getOrderStatus } = useOrderStatusStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.getOrders().then(data => {
            // Apply overrides first
            const updatedData = data.map(order => {
                const storedStatus = getOrderStatus(order.id);
                return storedStatus ? { ...order, status: storedStatus } : order;
            });
            // Show all orders except Drafts
            setOrders(updatedData.filter(o => o.status !== 'Draft'));
        });
    }, [getOrderStatus]);

    const getIcon = (serviceName: string) => {
        if (serviceName.includes('Video')) return <Video className="w-5 h-5" />;
        if (serviceName.includes('360')) return <Box className="w-5 h-5" />;
        if (serviceName.includes('Drone')) return <Plane className="w-5 h-5" />;
        if (serviceName.includes('Microsite') || serviceName.includes('Website')) return <Globe className="w-5 h-5" />;
        return <ImageIcon className="w-5 h-5" />;
    };

    const getTypeColor = (serviceName: string) => {
        if (serviceName.includes('Video')) return 'bg-purple-50 text-purple-600';
        if (serviceName.includes('360')) return 'bg-teal-50 text-teal-600';
        if (serviceName.includes('Drone')) return 'bg-orange-50 text-orange-600';
        if (serviceName.includes('Microsite') || serviceName.includes('Website')) return 'bg-emerald-50 text-emerald-600';
        return 'bg-blue-50 text-blue-600';
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Deliverables</h1>
                <p className="text-gray-500 mt-2 text-lg">Access and download your property marketing assets.</p>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by property address..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Deliverables List */}
            <div className="grid grid-cols-1 gap-8">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                        const orderAssets = getOrderAssets(order.id);

                        return (
                            <div key={order.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
                                {/* Property Sidebar info */}
                                <div className="lg:w-80 bg-gray-50/50 p-8 border-r border-gray-100 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{order.propertyAddress}</h3>
                                        <div className="inline-flex items-center px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase text-gray-400 border border-gray-100">
                                            Order ID: {order.id}
                                        </div>
                                        <div className="mt-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold",
                                                order.status === 'Delivered' ? "bg-emerald-100 text-emerald-700" :
                                                    order.status === 'Archived' ? "bg-gray-100 text-gray-700" :
                                                        "bg-blue-50 text-blue-600"
                                            )}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-200/50 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400">Shoot Date</p>
                                            <p className="font-bold text-gray-900">{order.shootDate}</p>
                                        </div>
                                        <button className="w-full flex items-center justify-center gap-2 py-3 bg-upca-blue text-white rounded-xl font-bold text-xs shadow-md shadow-upca-blue/10 hover:bg-upca-blue/90 transition-all">
                                            <Download className="w-4 h-4" />
                                            Download Invoice
                                        </button>
                                    </div>
                                </div>

                                {/* Assets Grid */}
                                <div className="flex-1 p-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Ordered Services & Assets</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {order.services.map((service, idx) => {
                                            const serviceAssets = orderAssets.filter(a => a.serviceId === service);
                                            const isReady = serviceAssets.length > 0;

                                            return (
                                                <div key={idx} className={cn(
                                                    "group p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px]",
                                                    isReady ? "border-gray-100 hover:border-upca-blue/30 hover:bg-subtle-gradient bg-white" : "border-gray-100 bg-gray-50/50 opacity-70"
                                                )}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", getTypeColor(service))}>
                                                            {getIcon(service)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 leading-tight">{service}</p>
                                                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                                                {isReady ? `${serviceAssets.length} file${serviceAssets.length !== 1 ? 's' : ''} available` : 'Processing...'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {isReady && (
                                                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                                                            {serviceAssets.map(asset => (
                                                                <div key={asset.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                                                    <span className="text-xs font-medium text-gray-600 truncate max-w-[150px]">{asset.name}</span>
                                                                    <div className="flex gap-2">
                                                                        {asset.type === 'link' ? (
                                                                            <a
                                                                                href={asset.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                                                            >
                                                                                <Globe className="w-3 h-3" />
                                                                                Visit
                                                                            </a>
                                                                        ) : (
                                                                            <a
                                                                                href={asset.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-1 px-3 py-1.5 bg-upca-blue text-white text-xs font-bold rounded-lg hover:bg-upca-blue/90 transition-colors"
                                                                            >
                                                                                <Download className="w-3 h-3" />
                                                                                Download
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <Box className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">No deliverables found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2">Any assets from active orders will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
