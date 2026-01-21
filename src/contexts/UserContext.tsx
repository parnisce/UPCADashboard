import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        refreshUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            // refreshUser will re-fetch the user details from Supabase (via api.getCurrentUser)
            refreshUser();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, isLoading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
