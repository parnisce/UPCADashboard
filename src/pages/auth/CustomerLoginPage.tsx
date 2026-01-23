import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const CustomerLoginPage: React.FC = () => {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-upca-blue tracking-tighter mb-2">UPCA<span className="text-upca-teal">.CA</span></h1>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/50 text-blue-700 text-sm font-semibold border border-blue-200">
                        <User className="w-4 h-4" />
                        Customer Portal
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/50">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h2>
                    <p className="text-gray-500 text-sm text-center mb-8">Sign in to manage your property media</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50/50 backdrop-blur border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-upca-blue transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-upca-blue/20 focus:bg-white transition-all outline-none border text-gray-900 placeholder:text-gray-400"
                                    placeholder="name@brokerage.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-upca-blue transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-upca-blue/20 focus:bg-white transition-all outline-none border text-gray-900 placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-upca-blue focus:ring-upca-blue" />
                                <span className="text-gray-600 font-medium">Remember me</span>
                            </label>
                            <a href="#" className="text-upca-blue font-bold hover:underline">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-upca-blue text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-gray-500 font-medium">
                        New to UPCA? <Link to="/register" className="text-upca-blue font-bold hover:underline">Create Account</Link>
                    </p>
                    <div className="pt-4 border-t border-gray-200/50">
                        <Link to="/admin/login" className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors">
                            Admin Access
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
