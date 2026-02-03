import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    DollarSign,
    Calendar,
    ShoppingBag,
    MessageSquare,
    LogOut,
    Menu,
    User,
    ArrowLeft
} from 'lucide-react';
import { cn } from '../services/utils';

const adminSidebarItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Services & Pricing', path: '/admin/services', icon: DollarSign },
    { name: 'Scheduled Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Order Management', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
];

export const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    const handleBackToClient = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-900 to-gray-800 z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-white/10">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            UPCA<span className="text-upca-yellow">.CA</span>
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {adminSidebarItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/admin'}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-upca-blue text-white shadow-lg shadow-upca-blue/20"
                                        : "text-gray-300 hover:bg-white/10"
                                )}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-white/10 space-y-2">
                        <button
                            onClick={handleBackToClient}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-200 w-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Client View</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 w-full"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
                    <button
                        className="p-2 lg:hidden text-gray-600"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1"></div>

                    <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-1.5 rounded-2xl transition-colors">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">UPCA Administrator</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-upca-blue to-upca-yellow flex items-center justify-center text-white border-2 border-white shadow-lg">
                            <User className="w-6 h-6" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
