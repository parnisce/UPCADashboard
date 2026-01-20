import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Home, Upload, Info, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const EditPropertyPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        address: '',
        mls: '',
        sqft: '',
        beds: '',
        baths: '',
        price: '',
        status: 'Coming soon'
    });

    useEffect(() => {
        if (id) {
            api.getPropertyById(id).then(property => {
                if (property) {
                    setFormData({
                        address: property.address,
                        mls: property.mls,
                        sqft: property.sqft.toString(),
                        beds: property.beds.toString(),
                        baths: property.baths.toString(),
                        price: property.price.toString(),
                        status: property.status
                    });
                    setThumbnail(property.thumbnail);
                }
                setIsLoading(false);
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSubmitting(true);
        try {
            await api.updateProperty(id, {
                address: formData.address,
                mls: formData.mls,
                sqft: Number(formData.sqft),
                beds: Number(formData.beds),
                baths: Number(formData.baths),
                price: Number(formData.price),
                status: formData.status as any,
                thumbnail: thumbnail || '',
            });
            alert('Property updated successfully!');
            navigate('/properties');
        } catch (error) {
            console.error(error);
            alert('Failed to update property.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setThumbnail(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-upca-blue" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-upca-blue transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Edit Property</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Home className="w-5 h-5 text-upca-blue" /> Basic Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">MLS Number</label>
                                        <input type="text" name="mls" value={formData.mls} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all appearance-none cursor-pointer">
                                            <option>Coming soon</option>
                                            <option>Active listing</option>
                                            <option>Sold</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Info className="w-5 h-5 text-teal-600" /> Property Details
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><label className="text-sm font-bold text-gray-600">Beds</label><input type="number" name="beds" value={formData.beds} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl" /></div>
                                <div><label className="text-sm font-bold text-gray-600">Baths</label><input type="number" name="baths" value={formData.baths} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl" /></div>
                                <div><label className="text-sm font-bold text-gray-600">Sq Ft</label><input type="number" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl" /></div>
                                <div><label className="text-sm font-bold text-gray-600">Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Thumbnail</h2>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center cursor-pointer hover:border-upca-blue transition-all overflow-hidden relative group">
                                {thumbnail ? (
                                    <>
                                        <img src={thumbnail} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><p className="text-white font-bold text-sm">Change</p></div>
                                    </>
                                ) : (
                                    <Upload className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-12 py-4 bg-upca-blue text-white rounded-2xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 disabled:opacity-50 min-w-[160px]">
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};
