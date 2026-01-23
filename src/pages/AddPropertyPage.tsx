import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, MapPin, Hash, Ruler, Bed, Bath, DollarSign, Upload, Info, X } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

export const AddPropertyPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        address: '',
        mls: '',
        sqft: '',
        beds: '',
        baths: '',
        price: '',
        status: 'Coming soon' as const,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // ✅ Check login (Incognito usually has no session)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            if (!session) {
                alert('Please log in first.');
                navigate('/login');
                return;
            }

            await api.createProperty({
                address: formData.address,
                mls: formData.mls,
                sqft: Number(formData.sqft),
                beds: Number(formData.beds),
                baths: Number(formData.baths),
                price: Number(formData.price),
                status: formData.status as any,

                // ✅ API maps this to thumbnail_url in DB
                thumbnail:
                    thumbnail ||
                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80',

                // ✅ RLS owner column in your DB schema
                user_id: session.user.id,
            });

            alert('Property added successfully!');
            navigate('/properties');
        } catch (error: any) {
            console.error(error);
            alert(error?.message || 'Failed to save property.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                // Resize to max 800px width/height while maintaining aspect ratio
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const max = 800;

                if (width > height) {
                    if (width > max) {
                        height *= max / width;
                        width = max;
                    }
                } else {
                    if (height > max) {
                        width *= max / height;
                        height = max;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with 0.7 quality
                const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setThumbnail(resizedDataUrl);
            };

            img.src = reader.result as string;
        };

        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeThumbnail = (e: React.MouseEvent) => {
        e.stopPropagation();
        setThumbnail(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-upca-blue transition-colors font-medium group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <div className="md:flex md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Add New Property</h1>
                    <p className="text-gray-500 mt-2 text-lg">Enter details for your new listing.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Info */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-upca-blue">
                                    <Home className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Full Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        placeholder="Enter full property address"
                                        className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Hash className="w-4 h-4" /> MLS Number
                                        </label>
                                        <input
                                            type="text"
                                            name="mls"
                                            placeholder="e.g. C1234567"
                                            className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                                            value={formData.mls}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Info className="w-4 h-4" /> Listing Status
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="status"
                                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all appearance-none cursor-pointer"
                                                value={formData.status}
                                                onChange={handleChange}
                                            >
                                                <option>Coming soon</option>
                                                <option>Active listing</option>
                                                <option>Sold</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                                    <Info className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Property Details</h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Beds</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="beds"
                                            className="w-full p-4 pl-10 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                                            value={formData.beds}
                                            onChange={handleChange}
                                        />
                                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Baths</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="baths"
                                            className="w-full p-4 pl-10 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                                            value={formData.baths}
                                            onChange={handleChange}
                                        />
                                        <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Sq Ft</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="sqft"
                                            className="w-full p-4 pl-10 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                                            value={formData.sqft}
                                            onChange={handleChange}
                                        />
                                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="price"
                                            className="w-full p-4 pl-10 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                                            value={formData.price}
                                            onChange={handleChange}
                                        />
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Thumbnail Upload */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Thumbnail</h2>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div
                                onClick={triggerFileInput}
                                className="aspect-[4/3] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-upca-blue hover:text-upca-blue transition-all cursor-pointer bg-gray-50 overflow-hidden relative group"
                            >
                                {thumbnail ? (
                                    <>
                                        <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-bold text-sm">Change Image</p>
                                        </div>
                                        <button
                                            onClick={removeThumbnail}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-900 rounded-full hover:bg-white shadow-sm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900">Upload image</p>
                                            <p className="text-xs">JPG or PNG, max 10MB</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Help Text */}
                        <div className="bg-gradient-to-br from-upca-blue to-upca-teal p-8 rounded-3xl text-white shadow-xl shadow-upca-blue/20">
                            <h3 className="font-bold text-lg mb-2">Need help?</h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                Don't have all the details yet? You can still add the property and update it later when you're ready to book services.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-12 py-4 bg-upca-blue text-white rounded-2xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Property'}
                    </button>
                </div>
            </form>
        </div>
    );
};
