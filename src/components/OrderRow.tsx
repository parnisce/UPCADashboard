import React from 'react';
import { ArrowRight, MapPin, Calendar } from 'lucide-react';
import type { Order } from '../types';
import { cn } from '../services/utils';

interface OrderRowProps {
    order: Order;
}

export const OrderRow: React.FC<OrderRowProps> = ({ order }) => {
    return (
        <tr className="hover:bg-gray-50/50 transition-colors group">
            <td className="px-6 py-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-upca-blue/5 flex items-center justify-center text-upca-blue">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 group-hover:text-upca-blue transition-colors">{order.propertyAddress}</p>
                        <p className="text-xs text-gray-500 mt-1">Order #{order.id}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-6 font-medium text-gray-600">
                <div className="flex flex-wrap gap-1">
                    {order.services.map((s, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold uppercase truncate max-w-[100px]">
                            {s.split(' ')[0]}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-6 py-6 font-medium text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {order.shootDate}
                </div>
            </td>
            <td className="px-6 py-6">
                <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                    order.status === 'Delivered' ? "bg-emerald-100 text-emerald-700" :
                        order.status === 'Scheduled' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                )}>
                    {order.status}
                </span>
            </td>
            <td className="px-6 py-6 text-right">
                <button className="p-2 hover:bg-upca-blue/5 rounded-full text-upca-blue transition-all">
                    <ArrowRight className="w-5 h-5" />
                </button>
            </td>
        </tr>
    );
};
