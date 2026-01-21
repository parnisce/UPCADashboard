import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { OrderRow } from '../components/OrderRow';
import { cn } from '../services/utils';

import { useOrderStatusStore } from '../stores/servicesStore';

export const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { getOrderStatus } = useOrderStatusStore();

    useEffect(() => {
        api.getOrders().then(data => {
            const updatedData = data.map(order => {
                const storedStatus = getOrderStatus(order.id);
                return storedStatus ? { ...order, status: storedStatus } : order;
            });
            setOrders(updatedData);
        });
    }, [getOrderStatus]);

    const statuses: (OrderStatus | 'All')[] = ['All', 'Scheduled', 'In Progress', 'Editing', 'Delivered', 'Archived'];

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
            o.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
                    <p className="text-gray-500">Manage and track all your property marketing projects.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 border rounded-xl font-semibold transition-colors",
                            isFilterOpen || statusFilter !== 'All'
                                ? "bg-upca-blue text-white border-upca-blue"
                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        {statusFilter === 'All' ? 'Filters' : statusFilter}
                    </button>
                    <button
                        onClick={() => navigate('/orders/new')}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-upca-blue text-white rounded-xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 transition-all"
                    >
                        New Order
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                if (status !== 'All') setIsFilterOpen(false);
                            }}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                                statusFilter === status
                                    ? "bg-upca-blue text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                    {statusFilter !== 'All' && (
                        <button
                            onClick={() => setStatusFilter('All')}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by address or MLS..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Orders Table/List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Property Address</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Services</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Shoot Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <OrderRow key={order.id} order={order} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No orders found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
