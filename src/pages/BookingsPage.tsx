import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    Plus,
    MoreHorizontal,
    Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Order } from '../types';
import { cn } from '../services/utils';
import { useOrderStatusStore } from '../stores/servicesStore';

export const BookingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const { getOrderStatus } = useOrderStatusStore();

    useEffect(() => {
        api.getOrders().then(data => {
            const updatedData = data.map(order => {
                const storedStatus = getOrderStatus(order.id);
                return storedStatus ? { ...order, status: storedStatus } : order;
            });
            // Filter only relevant active statuses for the calendar
            setOrders(updatedData.filter(o =>
                ['Scheduled', 'In Progress', 'Editing', 'Delivered'].includes(o.status)
            ));
        });
    }, [getOrderStatus]);

    // Calendar logic
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const isSelected = (day: number) => {
        return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    };

    const getOrdersForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return orders.filter(o => o.shootDate === dateStr);
    };

    const selectedDateOrders = orders.filter(o => {
        // Add 1 day if timezone issues occur, but here we assume simple match
        const shootDateObj = new Date(o.shootDate + 'T12:00:00'); // Use noon to avoid TZ issues
        return shootDateObj.getDate() === selectedDate.getDate() &&
            shootDateObj.getMonth() === selectedDate.getMonth() &&
            shootDateObj.getFullYear() === selectedDate.getFullYear();
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bookings & Calendar</h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage your shoot schedule and upcoming appointments.</p>
                </div>
                <button
                    onClick={() => {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                        navigate(`/orders/new?date=${dateStr}`);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-upca-blue text-white rounded-xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Book New Shoot
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Section */}
                <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900">{monthNames[month]} {year}</h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                <ChevronLeft className="w-6 h-6 text-gray-400" />
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                <ChevronRight className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-[10px] font-black uppercase text-gray-400 tracking-widest py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-24" />
                        ))}
                        {Array.from({ length: totalDays }).map((_, i) => {
                            const day = i + 1;
                            const dayOrders = getOrdersForDay(day);
                            const hasOrders = dayOrders.length > 0;

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    className={cn(
                                        "h-24 rounded-2xl p-2 border transition-all flex flex-col items-center justify-between relative group",
                                        isSelected(day) ? "border-upca-blue bg-upca-blue/5 ring-2 ring-upca-blue/20" : "border-gray-50 hover:border-gray-200 bg-white",
                                        isToday(day) && !isSelected(day) && "bg-gray-50"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mt-1",
                                        isToday(day) ? "bg-upca-blue text-white" : "text-gray-900"
                                    )}>
                                        {day}
                                    </span>

                                    {hasOrders && (
                                        <div className="w-full flex justify-center gap-1 mb-1">
                                            {dayOrders.map((_, idx) => (
                                                <div key={idx} className="w-2 h-2 rounded-full bg-upca-blue animate-pulse" />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </h3>
                            <div className="p-2 bg-gray-50 rounded-xl">
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {selectedDateOrders.length > 0 ? (
                                selectedDateOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="p-5 rounded-3xl bg-gray-50 border border-transparent hover:border-upca-blue/20 cursor-pointer transition-all group"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase text-upca-blue border border-upca-blue/10">
                                                {order.status}
                                            </span>
                                            <button className="text-gray-300 hover:text-gray-600">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-gray-900 leading-tight group-hover:text-upca-blue transition-colors">{order.propertyAddress}</h4>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                Scheduled for 10:00 AM
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Camera className="w-4 h-4" />
                                                {order.services.length} Services Booked
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-400 font-medium">No bookings scheduled<br />for this date.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-[40px] text-white overflow-hidden relative group">
                        <h3 className="text-xl font-bold relative z-10">Sync with Google</h3>
                        <p className="text-gray-400 text-sm mt-2 relative z-10 mb-6">Connect your Google Calendar to sync all upcoming property shoots automatically.</p>
                        <button className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold relative z-10 hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                            Connect Calendar
                        </button>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-upca-blue/20 rounded-full blur-3xl group-hover:bg-upca-blue/30 transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};
