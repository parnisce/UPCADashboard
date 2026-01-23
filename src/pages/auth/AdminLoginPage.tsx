import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) throw signInError;

            const user = authData.user;
            if (!user) throw new Error('Login failed.');

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            const role = profile?.role ?? 'customer';

            if (role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/properties', { replace: true });
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">UPCA<span className="text-indigo-500">.ADMIN</span></h1>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-semibold border border-indigo-500/20">
                        <ShieldCheck className="w-4 h-4" />
                        Administrative Portal
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-slate-800">
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">Admin Access</h2>
                    <p className="text-slate-400 text-sm text-center mb-8">Secure login for system administrators</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-all outline-none border text-white placeholder:text-slate-600"
                                    placeholder="admin@upca.ca"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-all outline-none border text-white placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Authenticating...' : 'Access Dashboard'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <div className="pt-4 border-t border-slate-800">
                        <Link to="/login" className="text-sm text-slate-600 hover:text-slate-400 font-medium transition-colors">
                            Return to Customer Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
