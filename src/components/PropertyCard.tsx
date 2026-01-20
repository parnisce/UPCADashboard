import React from 'react';
import { ExternalLink, BedDouble, Bath, Square } from 'lucide-react';
import type { Property } from '../types';

interface PropertyCardProps {
    property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    return (
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="relative h-56">
                <img
                    src={property.thumbnail}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={property.address}
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black uppercase text-gray-900 shadow-sm">
                        {property.status}
                    </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <button className="w-full bg-white text-upca-blue py-3 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2">
                        View Property Details
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{property.address}</h3>
                <p className="text-upca-blue font-bold text-lg mb-4">${property.price.toLocaleString()}</p>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-4 text-gray-500 font-medium text-sm">
                        <div className="flex items-center gap-1.5">
                            <BedDouble className="w-4 h-4" /> {property.beds}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4" /> {property.baths}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Square className="w-4 h-4" /> {property.sqft} <span className="text-[10px]">SQFT</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">MLS® Number</p>
                        <p className="text-xs font-bold text-gray-900">{property.mls}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
