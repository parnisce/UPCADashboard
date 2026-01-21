import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Calendar as CalendarIcon, CheckCircle, ArrowRight, Map } from 'lucide-react';
import type { Order, Property } from '../types';
import { api } from '../services/api';
import { cn } from '../services/utils';
import { StatCard } from '../components/StatCard';
import { useUser } from '../contexts/UserContext';
import { useOrderStatusStore } from '../stores/servicesStore';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, isLoading: userLoading } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const { getOrderStatus } = useOrderStatusStore();

    useEffect(() => {
        const fetchData = async () => {
            const [ordersData, propsData] = await Promise.all([
                api.getOrders(),
                api.getProperties()
            ]);

            // Apply updated statuses from store
            const updatedOrders = ordersData.map(order => {
                const storedStatus = getOrderStatus(order.id);
                return storedStatus ? { ...order, status: storedStatus } : order;
            });

            setOrders(updatedOrders);
            setProperties(propsData);
        };
        fetchData();
    }, [getOrderStatus]);

    const stats = [
        { label: 'Active Orders', value: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Archived').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Upcoming Shoots', value: orders.filter(o => o.status === 'Scheduled').length, icon: CalendarIcon, color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Properties', value: properties.length, icon: Map, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Recently Delivered', value: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Archived');

    if (userLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-upca-blue border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0] || 'Agent'}!</h1>
                    <p className="text-gray-500 mt-1">Here's what's happening with your property listings today.</p>
                </div>
                <button
                    onClick={() => navigate('/orders/new')}
                    className="inline-flex items-center justify-center gap-2 bg-upca-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 hover:-translate-y-0.5 transition-all"
                >
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
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Active Orders</h2>
                                <p className="text-sm text-gray-500 mt-1">Status of your current photography projects.</p>
                            </div>
                            <button
                                onClick={() => navigate('/orders')}
                                className="p-2 hover:bg-gray-50 rounded-full transition-colors group-hover:translate-x-1 duration-300"
                            >
                                <ArrowRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {activeOrders.length > 0 ? (
                                activeOrders.slice(0, 3).map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-transparent hover:border-upca-blue/10 hover:bg-white hover:shadow-md transition-all duration-300 group/item"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-upca-blue font-bold">
                                                {order.propertyAddress.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover/item:text-upca-blue transition-colors">{order.propertyAddress}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-gray-100 font-bold text-gray-400 uppercase tracking-tight">{order.id}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {new Date(order.shootDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                order.status === 'Scheduled' ? "bg-blue-100 text-blue-700" :
                                                    order.status === 'In Progress' ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"
                                            )}>
                                                {order.status}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/orders/${order.id}`)}
                                                className="p-2 text-gray-300 hover:text-upca-blue transition-colors"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No active orders yet.</p>
                                    <button
                                        onClick={() => navigate('/orders/new')}
                                        className="text-upca-blue font-bold text-sm mt-2 hover:underline"
                                    >
                                        Create your first order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Calendar Preview */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-gray-900">Upcoming Shoots</h2>
                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'Scheduled').slice(0, 4).map(order => (
                                <div key={order.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
                                    <div className="flex-shrink-0 w-12 h-14 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100 group-hover:bg-upca-blue group-hover:border-upca-blue transition-all">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase group-hover:text-white/70">
                                            {new Date(order.shootDate).toLocaleString('default', { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-black text-gray-900 group-hover:text-white">
                                            {new Date(order.shootDate).getDate()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm truncate">{order.propertyAddress}</p>
                                        <p className="text-xs text-gray-500 mt-1">10:00 AM • Photography</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/bookings')}
                            className="w-full mt-6 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-upca-blue hover:text-white transition-all"
                        >
                            View Full Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
