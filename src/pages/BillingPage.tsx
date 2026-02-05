import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Download,
    Search,
    Filter,
    TrendingUp,
    Clock,
    CheckCircle,
    FileText,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Order } from '../types';
import { cn } from '../services/utils';

export const BillingPage: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api.getOrders();
                setOrders(data);
                // In a real app, we'd also fetch stats dynamically based on these orders
            } catch (error) {
                console.error("Failed to fetch billing data", error);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(o =>
        o.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase())
    );

    const totalSpent = orders.reduce((sum, order) => {
        if (order.paymentStatus === 'paid') {
            const subtotal = order.totalAmount || 0;
            return sum + (subtotal * 1.13);
        }
        return sum;
    }, 0);

    const unpaidCount = orders.filter(o => o.paymentStatus === 'pending').length;
    const paidCount = orders.filter(o => o.paymentStatus === 'paid').length;

    const stats = [
        { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Unpaid Invoices', value: unpaidCount.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Payments Completed', value: paidCount.toString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Billing & Invoices</h1>
                    <p className="text-gray-500 mt-2 text-lg">Download receipts and track your marketing spend.</p>
                </div>
                <button
                    onClick={() => navigate('/billing/payment-methods')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-upca-blue text-white rounded-xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 transition-all"
                >
                    <CreditCard className="w-5 h-5" />
                    Manage Payment Methods
                </button>
            </div>

            {/* Billing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center", stat.bg)}>
                            <stat.icon className={cn("w-8 h-8", stat.color)} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-loose">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Invoices List */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by property or order ID..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-2 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        <Filter className="w-5 h-5" />
                        Filter Date
                    </button>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order & Property</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Services Provided</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="group hover:bg-gray-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-upca-blue transition-colors">{order.propertyAddress}</p>
                                                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">#{order.id}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {order.services.map((s, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded-md text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                                                            {s.split(' ')[0]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900">${((order.totalAmount || 0) * 1.13).toFixed(2)}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">via Cardending in 4242</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                                    order.paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-700" :
                                                        order.paymentStatus === 'pending' ? "bg-orange-100 text-orange-700" :
                                                            "bg-gray-100 text-gray-700"
                                                )}>
                                                    {order.paymentStatus || 'Pendng'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-upca-blue hover:text-white transition-all">
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">No invoices yet</h3>
                                            <p className="text-gray-500 text-sm mt-1">When your orders are completed, invoices will appear here.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Upcoming Payment Alert */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold">Auto-Billing is active</h3>
                    <p className="text-gray-400 mt-1 max-w-md">Your next order will be automatically charged to your primary Visa card. You can change this in settings.</p>
                </div>
                <button
                    onClick={() => navigate('/billing/payment-methods')}
                    className="relative z-10 px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
                >
                    Payment Settings
                    <ArrowUpRight className="w-5 h-5" />
                </button>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-upca-blue/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-upca-yellow/5 rounded-full blur-[80px] -ml-24 -mb-24" />
            </div>
        </div>
    );
};
