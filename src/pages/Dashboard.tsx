import { useEffect, useState } from 'react';
import { Plus, Clock, Calendar as CalendarIcon, CheckCircle, ArrowRight, Map } from 'lucide-react';
import type { Order, Property } from '../types';
import { api } from '../services/api';
import { cn } from '../services/utils';
import { StatCard } from '../components/StatCard';

export const Dashboard: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [ordersData, propsData] = await Promise.all([
                api.getOrders(),
                api.getProperties()
            ]);
            setOrders(ordersData);
            setProperties(propsData);
        };
        fetchData();
    }, []);

    const stats = [
        { label: 'Active Orders', value: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Archived').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Upcoming Shoots', value: orders.filter(o => o.status === 'Scheduled').length, icon: CalendarIcon, color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Properties', value: properties.length, icon: Map, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Recently Delivered', value: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Archived');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
                    <p className="text-gray-500 mt-1">Here's what's happening with your property listings today.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 bg-upca-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 hover:-translate-y-0.5 transition-all">
                    <Plus className="w-5 h-5" />
                    Create New Order
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Orders Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Active Projects</h2>
                        <button className="text-upca-blue font-semibold text-sm hover:underline">View all</button>
                    </div>
                    <div className="space-y-4">
                        {activeOrders.length > 0 ? (
                            activeOrders.map((order) => (
                                <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-upca-blue/30 transition-colors group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                                <img
                                                    src={properties.find(p => p.id === order.propertyId)?.thumbnail}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-upca-blue transition-colors">{order.propertyAddress}</h3>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {order.services.map((s, i) => (
                                                        <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                            {s === 'Real Estate Photography' ? 'Photo' : s === 'Property Video Tours' ? 'Video' : 'Drone'}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    Shoot date: {order.shootDate}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold",
                                                order.status === 'Delivered' ? "bg-emerald-100 text-emerald-700" :
                                                    order.status === 'Scheduled' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                                            )}>
                                                {order.status}
                                            </span>
                                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                                <p className="text-gray-500">No active projects at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Deliverables / Sidebar Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Recently Delivered</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                        {orders.filter(o => o.status === 'Delivered').map((order) => (
                            <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                <p className="text-sm font-bold text-gray-900 truncate">{order.propertyAddress}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <button className="flex-1 bg-upca-blue/5 text-upca-blue text-xs font-bold py-2 rounded-lg hover:bg-upca-blue/10 transition-colors">
                                        View Media
                                    </button>
                                    <button className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-br from-upca-blue to-upca-teal p-6 rounded-2xl text-white shadow-xl shadow-upca-blue/20">
                        <h3 className="font-bold text-lg">Need a new shoot?</h3>
                        <p className="text-white/80 text-sm mt-1">Book your next property marketing session in under 2 minutes.</p>
                        <button className="mt-4 w-full bg-white text-upca-blue font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
