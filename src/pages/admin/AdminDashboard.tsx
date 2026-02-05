import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
    Calendar,
    ShoppingBag,
    MessageSquare,
    TrendingUp,
    CheckCircle,
    Clock
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import type { Order } from '../../types';
import { api } from '../../services/api';
import { cn } from '../../services/utils';
import { useOrderStatusStore } from '../../stores/servicesStore';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { getOrderStatus } = useOrderStatusStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ordersData = await api.getOrders();
                // Apply status updates from store
                const updatedOrders = ordersData.map(order => {
                    const storedStatus = getOrderStatus(order.id);
                    return storedStatus ? { ...order, status: storedStatus } : order;
                });
                setOrders(updatedOrders);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [getOrderStatus]);

    const pendingOrders = orders.filter(o => o.status === 'Draft' || o.status === 'Scheduled');
    const inProgressOrders = orders.filter(o => o.status === 'In Progress' || o.status === 'Editing');
    const completedOrders = orders.filter(o => o.status === 'Delivered');

    // Calculate real total revenue from paid orders
    const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const stats = [
        {
            label: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Pending Orders',
            value: pendingOrders.length,
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
        {
            label: 'In Progress',
            value: inProgressOrders.length,
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Completed',
            value: completedOrders.length,
            icon: CheckCircle,
            color: 'text-teal-600',
            bg: 'bg-teal-50'
        },
    ];

    const recentOrders = orders.slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-upca-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your UPCA business operations</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={() => navigate('/admin/services')}
                    className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center"
                >
                    <DollarSign className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">Services & Pricing</h3>
                    <p className="text-sm text-blue-100 mt-1">Manage offerings</p>
                </button>
                <button
                    onClick={() => navigate('/admin/bookings')}
                    className="p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center"
                >
                    <Calendar className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">Scheduled Bookings</h3>
                    <p className="text-sm text-teal-100 mt-1">View calendar</p>
                </button>
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center"
                >
                    <ShoppingBag className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">Order Management</h3>
                    <p className="text-sm text-purple-100 mt-1">Update statuses</p>
                </button>
                <button
                    onClick={() => navigate('/admin/messages')}
                    className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center"
                >
                    <MessageSquare className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">Messages</h3>
                    <p className="text-sm text-orange-100 mt-1">Client communication</p>
                </button>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                        <p className="text-sm text-gray-500 mt-1">Latest order activity</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="text-upca-blue font-bold text-sm hover:underline"
                    >
                        View All
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Property</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Agent</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="py-4 px-4 font-mono text-sm text-gray-600">#{order.id}</td>
                                    <td className="py-4 px-4 font-medium text-gray-900">{order.propertyAddress}</td>
                                    <td className="py-4 px-4 text-gray-600">{order.agentName}</td>
                                    <td className="py-4 px-4 text-gray-600">{order.shootDate}</td>
                                    <td className="py-4 px-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold",
                                            order.status === 'Delivered' ? "bg-emerald-100 text-emerald-700" :
                                                order.status === 'Scheduled' ? "bg-blue-100 text-blue-700" :
                                                    order.status === 'In Progress' ? "bg-orange-100 text-orange-700" :
                                                        "bg-gray-100 text-gray-700"
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
