import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../services/utils';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
    bg: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, bg }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", bg)}>
                <Icon className={cn("w-6 h-6", color)} />
            </div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
};
