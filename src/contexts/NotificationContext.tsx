import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../services/utils';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = (message: string, type: NotificationType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto remove after 3s
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300",
                            "bg-white min-w-[300px]",
                            notification.type === 'success' && "border-green-100 text-green-800",
                            notification.type === 'error' && "border-red-100 text-red-800",
                            notification.type === 'info' && "border-blue-100 text-blue-800"
                        )}
                    >
                        {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                        {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                        <span className="font-medium text-sm">{notification.message}</span>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
