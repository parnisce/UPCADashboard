import React, { useState, useEffect } from 'react';
import {
    Download,
    ExternalLink,
    Image as ImageIcon,
    Video,
    Box,
    Plane,
    Globe,
    Search,
    Copy,
    Check
} from 'lucide-react';
import { api } from '../services/api';
import type { Order, Deliverable } from '../types';
import { cn } from '../services/utils';

export const DeliverablesPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | Deliverable['type']>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        api.getOrders().then(data => {
            // Filter only orders that have deliverables
            setOrders(data.filter(o => o.deliverables && o.deliverables.length > 0));
        });
    }, []);

    const copyToClipboard = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getIcon = (type: Deliverable['type']) => {
        switch (type) {
            case 'photo': return <ImageIcon className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case '360': return <Box className="w-5 h-5" />;
            case 'drone': return <Plane className="w-5 h-5" />;
            case 'microsite': return <Globe className="w-5 h-5" />;
            default: return <ImageIcon className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type: Deliverable['type']) => {
        switch (type) {
            case 'photo': return 'bg-blue-50 text-blue-600';
            case 'video': return 'bg-purple-50 text-purple-600';
            case '360': return 'bg-teal-50 text-teal-600';
            case 'drone': return 'bg-orange-50 text-orange-600';
            case 'microsite': return 'bg-emerald-50 text-emerald-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase());
        const hasMatchingType = filterType === 'all' || order.deliverables?.some(d => d.type === filterType);
        return matchesSearch && hasMatchingType;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Deliverables</h1>
                <p className="text-gray-500 mt-2 text-lg">Access and download your property marketing assets.</p>
            </div>

            {/* Filters & Search */}
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
                <div className="flex gap-2">
                    <select
                        className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all font-bold text-gray-700"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                    >
                        <option value="all">All Types</option>
                        <option value="photo">Photography</option>
                        <option value="video">Cinematic Video</option>
                        <option value="360">360 Tours</option>
                        <option value="drone">Drone Assets</option>
                        <option value="microsite">Websites</option>
                    </select>
                </div>
            </div>

            {/* Deliverables List */}
            <div className="grid grid-cols-1 gap-8">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
                            {/* Property Sidebar info */}
                            <div className="lg:w-80 bg-gray-50/50 p-8 border-r border-gray-100 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{order.propertyAddress}</h3>
                                    <div className="inline-flex items-center px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase text-gray-400 border border-gray-100">
                                        Order ID: {order.id}
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-200/50 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400">Completed On</p>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {order.deliverables?.filter(d => filterType === 'all' || d.type === filterType).map((asset) => (
                                        <div key={asset.id} className="group p-5 rounded-2xl border border-gray-100 hover:border-upca-blue/30 hover:bg-subtle-gradient transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", getTypeColor(asset.type))}>
                                                    {getIcon(asset.type)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-none">{asset.label}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {asset.isWebOptimized && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">Web</span>}
                                                        {asset.isPrintOptimized && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Print</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {asset.type === 'microsite' ? (
                                                    <button
                                                        onClick={() => copyToClipboard(asset.url, asset.id)}
                                                        className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-upca-blue hover:text-white transition-all tooltip"
                                                        title="Copy URL"
                                                    >
                                                        {copiedId === asset.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                ) : (
                                                    <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-upca-blue hover:text-white transition-all">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <a
                                                    href={asset.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-upca-blue hover:text-white transition-all"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <Box className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">No deliverables found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2">Any assets from completed orders will appear here once our team has finished processing them.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
