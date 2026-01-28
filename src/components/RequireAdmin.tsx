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

                console.log("Checking admin status for:", user.email);

                // Check profile role
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error("Error fetching profile for admin check:", profileError);
                }

                const dbRole = profile?.role?.trim().toLowerCase();
                // Check for 'admin' (from user screenshot) or 'upca_admin' (from schema)
                const isProfileAdmin = dbRole === 'admin' || dbRole === 'upca_admin';

                // Fallback: Check email if DB check fails (safety net for RLS issues)
                const isEmailAdmin = user.email === 'admin@upca.ca';

                if (alive) {
                    const status = isProfileAdmin || isEmailAdmin;
                    console.log(`Admin Access: ${status} (DB Role: ${dbRole}, Email Auth: ${isEmailAdmin})`);
                    setIsAdmin(status);
                    setLoading(false);
                }
            } catch (e) {
                console.error("RequireAdmin check failed:", e);
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
