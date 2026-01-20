import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Property } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';

export const PropertiesPage: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        api.getProperties().then(setProperties);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Listings</h1>
                    <p className="text-gray-500">Manage your properties and their marketing assets.</p>
                </div>
                <button className="flex items-center gap-2 bg-upca-blue text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 transition-all">
                    <Plus className="w-5 h-5" />
                    Add Property
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>
        </div>
    );
};
