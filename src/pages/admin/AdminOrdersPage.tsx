import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { cn } from '../../services/utils';
import { useOrderStatusStore } from '../../stores/servicesStore';

export const AdminOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { updateOrderStatus: saveOrderStatus, getOrderStatus } = useOrderStatusStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchOrders = async () => {
            const data = await api.getOrders();
            // Apply status updates from store
            const updatedData = data.map(order => {
                const storedStatus = getOrderStatus(order.id);
                return storedStatus ? { ...order, status: storedStatus } : order;
            });
            setOrders(updatedData);
        };
        fetchOrders();
    }, [getOrderStatus]);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.agentName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        // Update local state
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
        // Save to store for real-time sync with client dashboard
        saveOrderStatus(orderId, newStatus);
        // In real app, would call API here
        // await api.updateOrderStatus(orderId, newStatus);
    };

    const toggleOrderSelection = (orderId: string) => {
        const newSelection = new Set(selectedOrders);
        if (newSelection.has(orderId)) {
            newSelection.delete(orderId);
        } else {
            newSelection.add(orderId);
        }
        setSelectedOrders(newSelection);
    };

    const statusOptions: OrderStatus[] = ['Draft', 'Scheduled', 'In Progress', 'Editing', 'Delivered', 'Archived'];

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'Draft': return 'bg-gray-100 text-gray-700';
            case 'Scheduled': return 'bg-blue-100 text-blue-700';
            case 'In Progress': return 'bg-orange-100 text-orange-700';
            case 'Editing': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-emerald-100 text-emerald-700';
            case 'Archived': return 'bg-gray-100 text-gray-500';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-500 mt-1">Update order statuses and manage workflow</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-upca-blue text-white rounded-xl font-semibold hover:bg-upca-blue/90 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by address, order ID, or agent..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-upca-blue/20 focus:border-upca-blue outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-upca-blue/20 focus:border-upca-blue outline-none appearance-none bg-white"
                        >
                            <option value="all">All Statuses</option>
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedOrders.size > 0 && (
                    <div className="mt-4 p-4 bg-upca-blue/5 rounded-xl flex items-center justify-between">
                        <p className="text-sm font-bold text-upca-blue">
                            {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
                        </p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-upca-blue text-white rounded-lg text-sm font-semibold hover:bg-upca-blue/90 transition-colors">
                                Bulk Update Status
                            </button>
                            <button
                                onClick={() => setSelectedOrders(new Set())}
                                className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="w-12 px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-upca-blue focus:ring-upca-blue"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
                                            } else {
                                                setSelectedOrders(new Set());
                                            }
                                        }}
                                    />
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Agent</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Services</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Shoot Date</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.has(order.id)}
                                            onChange={() => toggleOrderSelection(order.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-upca-blue focus:ring-upca-blue"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-gray-600">#{order.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{order.propertyAddress}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{order.agentName}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {order.services.slice(0, 2).map((service, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold"
                                                >
                                                    {service.split(' ')[0]}
                                                </span>
                                            ))}
                                            {order.services.length > 2 && (
                                                <span className="text-xs text-gray-500">+{order.services.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{order.shootDate}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-bold border-0 outline-none cursor-pointer",
                                                getStatusColor(order.status)
                                            )}
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                                            className="text-upca-blue font-bold text-sm hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No orders found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {statusOptions.map(status => {
                    const count = orders.filter(o => o.status === status).length;
                    return (
                        <div key={status} className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                            <p className="text-2xl font-black text-gray-900">{count}</p>
                            <p className="text-xs text-gray-500 mt-1">{status}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
