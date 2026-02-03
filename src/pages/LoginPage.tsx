import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const LoginPage: React.FC = () => {
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
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-upca-blue/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-upca-teal/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-[480px] w-full relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-gray-200/50 mb-6 border border-gray-50 mx-auto">
                        <h1 className="text-3xl font-black tracking-tighter">
                            <span className="text-upca-blue">UP</span>
                            <span className="text-upca-teal">CA</span>
                        </h1>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-500 mt-2 font-medium">Modern Real Estate Media Portal</p>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/60 border border-gray-100/50 backdrop-blur-sm">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">Sign In</h3>
                        <p className="text-gray-500 text-sm">Access your property assets and orders</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-700 ml-1 uppercase tracking-wider">Email Address</label>
                            <div className="group relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-upca-blue transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-upca-blue/5 focus:bg-white focus:border-upca-blue/30 transition-all outline-none border text-gray-900 font-medium"
                                    placeholder="name@brokerage.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-xs font-bold text-upca-blue hover:text-upca-accent transition-colors">Forgot password?</a>
                            </div>
                            <div className="group relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-upca-blue transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-upca-blue/5 focus:bg-white focus:border-upca-blue/30 transition-all outline-none border text-gray-900 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center text-sm ml-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-5 h-5 rounded-md border-2 border-gray-200 text-upca-blue focus:ring-upca-blue transition-all cursor-pointer" />
                                <span className="text-gray-600 font-bold group-hover:text-gray-900 transition-colors">Stay signed in</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-upca-blue text-white py-4.5 rounded-2xl font-bold text-lg shadow-xl shadow-upca-blue/20 hover:bg-upca-accent hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In to Portal</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-gray-500 font-medium whitespace-nowrap">
                        New to UPCA.CA? <a href="#" className="text-upca-blue font-bold hover:text-upca-accent transition-colors ml-1">Create an account</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
