import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, AlertCircle, ShieldCheck, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminRegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        secretCode: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simple client-side gatekeeping for the "2 Register Page" requirement
        // In reality, this should be server-side or removed.
        if (formData.secretCode !== 'UPCA-ADMIN-2024') {
            setError("Invalid Admin Secret Code");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'admin'
                    }
                }
            });

            if (signUpError) throw signUpError;

            alert("Admin account created! Please sign in.");
            navigate('/admin/login');
        } catch (err: any) {
            console.error('Registration failed:', err);
            setError(err.message || 'Failed to create account');
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
                        Admin Registration
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-slate-800">
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">New Administrator</h2>
                    <p className="text-slate-400 text-sm text-center mb-8">Create a new system access account</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-all outline-none border text-white placeholder:text-slate-600"
                                    placeholder="Admin Name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-all outline-none border text-white placeholder:text-slate-600"
                                    placeholder="admin@upca.ca"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 ml-1">Secret Code</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    name="secretCode"
                                    value={formData.secretCode}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-all outline-none border text-white placeholder:text-slate-600"
                                    placeholder="Enter authorization code"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-all outline-none border text-white placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Confirm</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-all outline-none border text-white placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Creating Account...' : 'Register Agent'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center bg-">
                    <p className="text-slate-500 font-medium">
                        Already have access? <Link to="/admin/login" className="text-indigo-400 font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
