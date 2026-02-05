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

            const role = profile?.role?.trim().toLowerCase() ?? 'customer';

            // Also allow hardcoded admin email locally for login check
            const isEmailAdmin = user.email === 'admin@upca.ca';

            if (role === 'admin' || role === 'upca_admin' || isEmailAdmin) {
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
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Dark Mode Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-[480px] w-full relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-3xl shadow-xl shadow-black/50 mb-6 border border-slate-800 mx-auto">
                        <ShieldCheck className="w-10 h-10 text-indigo-500" />
                    </div>
                    <div className="mb-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-semibold border border-indigo-500/20">
                            <Lock className="w-4 h-4" />
                            Admin Console
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">System Access</h2>
                    <p className="text-slate-400 mt-2 font-medium">Internal Management Portal</p>
                </div>

                <div className="bg-slate-900/80 p-10 rounded-[2.5rem] shadow-2xl shadow-black/60 border border-slate-800 backdrop-blur-xl">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-1 leading-tight">Secure Login</h3>
                        <p className="text-slate-400 text-sm">Authorized personnel only</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Admin Email</label>
                            <div className="group relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-slate-800 focus:border-indigo-500/30 transition-all outline-none border text-white font-medium"
                                    placeholder="admin@upca.ca"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                            </div>
                            <div className="group relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-slate-800 focus:border-indigo-500/30 transition-all outline-none border text-white font-medium"
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
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Authenticate</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-10 text-center">
                    <Link to="/login" className="text-slate-500 hover:text-slate-300 font-medium transition-colors">
                        Return to Portal
                    </Link>
                </div>
            </div>
        </div>
    );
};
