import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Home,
    Calendar,
    Image as ImageIcon,
    CreditCard,
    MessageSquare,
    LogOut,
    Search,
    Menu,
    User
} from 'lucide-react';
import { cn } from '../services/utils';

const sidebarItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Properties', path: '/properties', icon: Home },
    { name: 'Bookings', path: '/bookings', icon: Calendar },
    { name: 'Deliverables', path: '/deliverables', icon: ImageIcon },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'Support', path: '/support', icon: MessageSquare },
];

import { useUser } from '../contexts/UserContext';

export const AppLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { user, isLoading } = useUser();

    const handleLogout = () => {
        navigate('/login');
    };

    if (isLoading) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* ... rest of components ... */}
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-upca-blue tracking-tight">UPCA<span className="text-upca-yellow">.CA</span></h1>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {sidebarItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-upca-blue text-white shadow-lg shadow-upca-blue/20"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-100 space-y-2">
                        {user?.role === 'upca_admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-upca-blue/5 hover:text-upca-blue transition-all duration-200 w-full mb-2"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="font-medium">Admin Panel</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
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

                    <div className="flex-1 max-w-xl mx-4 relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search address or MLS..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-upca-blue/20 transition-all outline-none"
                        />
                    </div>

                    <div
                        className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-1.5 rounded-2xl transition-colors"
                        onClick={() => navigate('/account')}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.brokerage}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-upca-blue/10 flex items-center justify-center text-upca-blue border border-upca-blue/20 overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6" />
                            )}
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
