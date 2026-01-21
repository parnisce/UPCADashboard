import { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Save, X } from 'lucide-react';
import type { ServiceType } from '../../types';
import { useServicesStore, type ServicePricing } from '../../stores/servicesStore';

export const AdminServicesPage: React.FC = () => {
    const { services, updateService } = useServicesStore();

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<ServicePricing | null>(null);

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditForm({ ...services[index] });
    };

    const handleSave = () => {
        if (editingIndex !== null && editForm) {
            updateService(editForm.id, editForm);
            setEditingIndex(null);
            setEditForm(null);
        }
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setEditForm(null);
    };

    const toggleActive = (index: number) => {
        const service = services[index];
        updateService(service.id, { isActive: !service.isActive });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Services & Pricing</h1>
                    <p className="text-gray-500 mt-1">Manage your service offerings and pricing structure</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 bg-upca-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 hover:-translate-y-0.5 transition-all">
                    <Plus className="w-5 h-5" />
                    Add New Service
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {services.map((service, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                    >
                        {editingIndex === index ? (
                            // Edit Mode
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Service Name</label>
                                    <input
                                        type="text"
                                        value={editForm?.name || ''}
                                        onChange={(e) => setEditForm(editForm ? { ...editForm, name: e.target.value as ServiceType } : null)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-upca-blue/20 focus:border-upca-blue outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Base Price ($)</label>
                                    <input
                                        type="number"
                                        value={editForm?.basePrice || 0}
                                        onChange={(e) => setEditForm(editForm ? { ...editForm, basePrice: Number(e.target.value) } : null)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-upca-blue/20 focus:border-upca-blue outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={editForm?.description || ''}
                                        onChange={(e) => setEditForm(editForm ? { ...editForm, description: e.target.value } : null)}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-upca-blue/20 focus:border-upca-blue outline-none resize-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${service.isActive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {service.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{service.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="p-2 text-gray-400 hover:text-upca-blue hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleActive(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4 p-4 bg-gradient-to-r from-upca-blue/5 to-upca-teal/5 rounded-xl">
                                    <DollarSign className="w-5 h-5 text-upca-blue" />
                                    <span className="text-2xl font-black text-gray-900">${service.basePrice}</span>
                                    <span className="text-sm text-gray-500">base price</span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Included Features</p>
                                    <ul className="space-y-1">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-upca-blue"></div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
