import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react";
import type { Order } from '../../types';
import { api } from '../../services/api';
import { cn } from '../../services/utils';

import { useOrderStatusStore } from '../../stores/servicesStore';

export const AdminBookingsPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedDate] = useState(new Date());
    console.log(selectedDate);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
    const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'in-progress'>('all');
    const { getOrderStatus } = useOrderStatusStore();

    useEffect(() => {
        const fetchOrders = async () => {
            const data = await api.getOrders();
            const updatedData = data.map(o => {
                const stored = getOrderStatus(o.id);
                return stored ? { ...o, status: stored } : o;
            });
            setOrders(updatedData);
        };
        fetchOrders();
    }, [getOrderStatus]);

    const scheduledOrders = orders.filter(o => {
        if (filterStatus === 'scheduled') return o.status === 'Scheduled';
        if (filterStatus === 'in-progress') return o.status === 'In Progress';
        return o.status === 'Scheduled' || o.status === 'In Progress';
    });

    const groupedByDate = scheduledOrders.reduce((acc, order) => {
        const date = order.shootDate;
        if (!acc[date]) acc[date] = [];
        acc[date].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
        new Date(a).getTime() - new Date(b).getTime()
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Scheduled Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage and view all scheduled photography sessions</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-sm focus:ring-2 focus:ring-upca-blue/20 focus:border-upca-blue outline-none"
                    >
                        <option value="all">All Bookings</option>
                        <option value="scheduled">Scheduled Only</option>
                        <option value="in-progress">In Progress</option>
                    </select>
                    <button
                        onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        {viewMode === 'list' ? 'Calendar View' : 'List View'}
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                    <CalendarIcon className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-3xl font-black">{scheduledOrders.filter(o => o.status === 'Scheduled').length}</p>
                    <p className="text-sm text-blue-100 mt-1">Upcoming Shoots</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
                    <Clock className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-3xl font-black">{scheduledOrders.filter(o => o.status === 'In Progress').length}</p>
                    <p className="text-sm text-orange-100 mt-1">In Progress</p>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg">
                    <MapPin className="w-8 h-8 mb-2 opacity-80" />
                    <p className="text-3xl font-black">{sortedDates.length}</p>
                    <p className="text-sm text-teal-100 mt-1">Unique Dates</p>
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-6">
                {sortedDates.length > 0 ? (
                    sortedDates.map((date) => (
                        <div key={date} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-upca-blue to-upca-teal p-4">
                                <div className="flex items-center gap-3 text-white">
                                    <CalendarIcon className="w-5 h-5" />
                                    <h3 className="font-bold text-lg">
                                        {new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </h3>
                                    <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                                        {groupedByDate[date].length} {groupedByDate[date].length === 1 ? 'booking' : 'bookings'}
                                    </span>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {groupedByDate[date].map((order) => (
                                    <div
                                        key={order.id}
                                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-xl bg-upca-blue/10 flex items-center justify-center text-upca-blue font-bold">
                                                        {order.propertyAddress.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 group-hover:text-upca-blue transition-colors">
                                                            {order.propertyAddress}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">{order.agentName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">10:00 AM - 11:30 AM</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {order.services.slice(0, 2).map((service, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold"
                                                            >
                                                                {service.split(' ')[0]}
                                                            </span>
                                                        ))}
                                                        {order.services.length > 2 && (
                                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">
                                                                +{order.services.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-bold",
                                                    order.status === 'Scheduled' ? "bg-blue-100 text-blue-700" :
                                                        order.status === 'In Progress' ? "bg-orange-100 text-orange-700" :
                                                            "bg-gray-100 text-gray-700"
                                                )}>
                                                    {order.status}
                                                </span>
                                                <button className="text-sm text-upca-blue font-bold hover:underline">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Scheduled Bookings</h3>
                        <p className="text-gray-500">There are no bookings matching your current filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
