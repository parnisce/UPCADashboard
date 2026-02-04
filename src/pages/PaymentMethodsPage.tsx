import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    CheckCircle2,
    ShieldCheck,
    ArrowLeft,
    Lock,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../services/utils';
import { api } from '../services/api';

interface PaymentMethod {
    id: string;
    type: 'visa' | 'mastercard' | 'amex';
    last4: string;
    expiry: string;
    isDefault: boolean;
    brandColor: string;
}

export const PaymentMethodsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        api.getPaymentMethods().then(setMethods);
    }, []);

    const setDefault = (id: string) => {
        setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
    };

    const removeMethod = (id: string) => {
        if (methods.find(m => m.id === id)?.isDefault) {
            alert("Please set another card as default before removing this one.");
            return;
        }
        setMethods(methods.filter(m => m.id !== id));
    };

    const handleAddMethod = async () => {
        setIsAdding(true);
        // Simulate Stripe Connect Flow

        // In a real app, this would redirect to Stripe or open Elements
        // For now, we simulate a successful connection
        const newMethod: PaymentMethod = {
            id: `pm_${Date.now()}`,
            type: 'visa',
            last4: '4242',
            expiry: '12/28',
            isDefault: methods.length === 0,
            brandColor: 'bg-[#0057b7]'
        };

        await api.addPaymentMethod(newMethod);
        setMethods(prev => [...prev, newMethod]);
        setIsAdding(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/billing')}
                    className="flex items-center gap-2 text-gray-500 hover:text-upca-blue transition-colors font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Billing
                </button>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Payment Methods</h1>
                    <p className="text-gray-500 mt-2 text-lg">Securely manage your credit cards and billing preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {methods.map((method) => (
                    <div
                        key={method.id}
                        className={cn(
                            "relative overflow-hidden rounded-[32px] p-8 transition-all border-2",
                            method.isDefault ? "border-upca-blue bg-white shadow-xl shadow-upca-blue/5" : "border-gray-100 bg-white hover:border-gray-200"
                        )}
                    >
                        {/* Card Branding */}
                        <div className="flex justify-between items-start mb-12">
                            <div className={cn("px-4 py-2 rounded-xl text-white font-bold uppercase tracking-widest text-[10px]", method.brandColor)}>
                                {method.type}
                            </div>
                            {method.isDefault && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-upca-blue/10 text-upca-blue rounded-full text-[10px] font-black uppercase">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Default
                                </div>
                            )}
                        </div>

                        {/* Card Content */}
                        <div className="space-y-1">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Card Number</p>
                            <p className="text-2xl font-black text-gray-900 tracking-widest">•••• •••• •••• {method.last4}</p>
                        </div>

                        <div className="mt-8 flex justify-between items-end">
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Expires</p>
                                <p className="font-bold text-gray-900">{method.expiry}</p>
                            </div>
                            <div className="flex gap-2">
                                {!method.isDefault && (
                                    <button
                                        onClick={() => setDefault(method.id)}
                                        className="px-4 py-2 text-xs font-bold text-upca-blue hover:bg-upca-blue/5 rounded-lg transition-colors"
                                    >
                                        Set as Default
                                    </button>
                                )}
                                <button
                                    onClick={() => removeMethod(method.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Subtle background pattern */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-50 rounded-full blur-3xl -z-0" />
                    </div>
                ))}

                {/* Add New Card Button Card */}
                <button
                    onClick={handleAddMethod}
                    disabled={isAdding}
                    className="rounded-[32px] border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center gap-4 hover:border-upca-blue/30 hover:bg-upca-blue/5 transition-all group min-h-[240px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-upca-blue/10">
                        {isAdding ? (
                            <Loader2 className="w-8 h-8 text-upca-blue animate-spin" />
                        ) : (
                            <Plus className="w-8 h-8 text-gray-400 group-hover:text-upca-blue" />
                        )}
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{isAdding ? 'Connecting to Stripe...' : 'Link a Payment Method'}</h3>
                        <p className="text-sm text-gray-400">Connect securely via Stripe to pay for orders.</p>
                    </div>
                </button>
            </div>

            {/* Security Footer */}
            <div className="bg-gray-50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Secure Payments via Stripe</h3>
                        <p className="text-sm text-gray-500">Your card data is encrypted and never stored on our servers.</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 opacity-30 grayscale contrast-125">
                    {/* Placeholder logos for branding feel */}
                    <div className="font-black italic text-xl">VISA</div>
                    <div className="font-black italic text-xl">Mastercard</div>
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span className="font-bold text-sm tracking-widest uppercase">SSL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
