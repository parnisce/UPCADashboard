import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const RequireAdmin: React.FC = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) throw error;

                const user = data.user;
                if (!user) {
                    if (alive) {
                        setIsAdmin(false);
                        setLoading(false);
                    }
                    return;
                }

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError) throw profileError;

                if (alive) {
                    setIsAdmin(profile?.role === 'admin');
                    setLoading(false);
                }
            } catch {
                if (alive) {
                    setIsAdmin(false);
                    setLoading(false);
                }
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    if (loading) return null; // or a spinner

    // Not logged in or not admin:

    // If not admin:
    if (!isAdmin) {
        // If they tried to open /admin, kick them out
        return <Navigate to="/properties" replace state={{ from: location }} />;
    }

    return <Outlet />;
};
