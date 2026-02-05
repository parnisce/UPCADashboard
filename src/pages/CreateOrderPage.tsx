import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Calendar, MapPin, Camera, Video, Box, Plane, Globe, ShoppingCart, Plus, CreditCard, Lock, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { Property, ServiceType } from '../types';
import { cn } from '../services/utils';
import { useServicesStore } from '../stores/servicesStore';

const iconMap: Record<string, any> = {
    'Camera': Camera,
    'Video': Video,
    'Box': Box,
    'Plane': Plane,
    'Globe': Globe,
    'ShoppingCart': ShoppingCart
};

export const CreateOrderPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const dateParam = queryParams.get('date');

    const services = useServicesStore(state => state.services);
    const isLoadingServices = useServicesStore(state => state.isLoading);
    const activeServices = React.useMemo(() => services.filter(s => s.isActive), [services]);

    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
    const [shootDate, setShootDate] = useState('');
    const hasInitializedFromUrl = React.useRef(false);

    // Initialize from URL only once
    useEffect(() => {
        if (!hasInitializedFromUrl.current && dateParam) {
            setShootDate(dateParam);
            setSelectedServices([
                'Real Estate Photography' as ServiceType,
                'Property Video Tours' as ServiceType,
                '360 / Virtual Tours' as ServiceType,
                'Drone Photos & Films' as ServiceType
            ]);
            hasInitializedFromUrl.current = true;
        }
    }, [dateParam]);
    const [notes, setNotes] = useState('');
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

    useEffect(() => {
        if (step === 4) {
            setIsLoadingPaymentMethods(true);
            api.getPaymentMethods().then(methods => {
                setPaymentMethods(methods);
                const defaultMethod = methods.find((m: any) => m.isDefault);
                if (defaultMethod) setSelectedPaymentMethod(defaultMethod.id);
                setIsLoadingPaymentMethods(false);
            });
        }
    }, [step]);

    const { setServices, setLoading } = useServicesStore();

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const data = await api.getServices();
                if (data && data.length > 0) setServices(data);
            } catch (error) {
                console.error('Fetch services error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
        api.getProperties().then(setProperties);
    }, [setServices, setLoading]);

    const toggleService = (serviceId: ServiceType) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(s => s !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step < 4) {
            setStep(step + 1);
            return;
        }

        const selectedProperty = properties.find(p => p.id === selectedPropertyId);
        if (!selectedProperty) return;

        if (!selectedPaymentMethod) {
            alert('Please select a payment method');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Charge Payment
            const subtotal = calculateTotal();
            const totalWithTax = subtotal * 1.13;
            const paymentResult = await api.chargePaymentMethod(selectedPaymentMethod, totalWithTax);

            if (!paymentResult.success) throw new Error('Payment failed');

            // 2. Create Order
            const servicePrices: Record<string, number> = {};
            selectedServices.forEach(serviceId => {
                const service = activeServices.find(s => s.id === serviceId);
                if (service) servicePrices[serviceId] = service.basePrice;
            });

            await api.createOrder({
                propertyId: selectedPropertyId,
                propertyAddress: selectedProperty.address,
                services: selectedServices,
                shootDate,
                paymentStatus: 'paid',
                servicePrices
            });

            // Success
            alert('Payment successful! Order confirmed.');
            navigate('/orders');
        } catch (error) {
            console.error(error);
            alert('Failed to process order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);

    const calculateTotal = () => {
        return selectedServices.reduce((total, serviceId) => {
            const service = activeServices.find(s => s.id === serviceId);
            return total + (service?.basePrice || 0);
        }, 0);
    };

    return (
        <div className="max-w-screen-2xl mx-auto space-y-8 pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-upca-blue transition-colors font-medium group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="md:flex md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Create New Order</h1>
                    <p className="text-gray-500 mt-2 text-lg">Book your professional property marketing services.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 w-12 rounded-full transition-all duration-500",
                                step >= i ? "bg-upca-blue" : "bg-gray-200"
                            )}
                        />
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Select Property */}
                {step === 1 && (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-upca-blue">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Which property is this for?</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {properties.map((property) => (
                                <button
                                    key={property.id}
                                    type="button"
                                    onClick={() => setSelectedPropertyId(property.id)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                                        selectedPropertyId === property.id
                                            ? "border-upca-blue bg-blue-50/50"
                                            : "border-gray-100 hover:border-gray-200 bg-white"
                                    )}
                                >
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={property.thumbnail} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{property.address}</p>
                                        <p className="text-xs text-gray-500 mt-1">MLS: {property.mls}</p>
                                    </div>
                                    {selectedPropertyId === property.id && (
                                        <div className="w-6 h-6 bg-upca-blue rounded-full flex items-center justify-center text-white">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => navigate('/properties/new')}
                                className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-upca-blue hover:text-upca-blue transition-all text-gray-500 font-bold"
                            >
                                <Plus className="w-5 h-5" />
                                Add New Property
                            </button>
                        </div>

                        <div className="pt-4">
                            <button
                                type="button"
                                disabled={!selectedPropertyId}
                                onClick={() => setStep(2)}
                                className="w-full md:w-auto px-8 py-4 bg-upca-blue text-white rounded-2xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 disabled:opacity-50 disabled:shadow-none transition-all"
                            >
                                Continue to Services
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Services */}
                {step === 2 && (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                                <Camera className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Select Services</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {isLoadingServices && services.length === 0 ? (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                    <p>Loading available services...</p>
                                </div>
                            ) : activeServices.length === 0 ? (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                                    <Camera className="w-8 h-8 mb-4 opacity-20" />
                                    <p>No active services found. Please contact support.</p>
                                </div>
                            ) : activeServices.map((service) => {
                                const Icon = iconMap[service.icon || 'Camera'] || Camera;
                                const isSelected = selectedServices.includes(service.id);
                                return (
                                    <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => toggleService(service.id)}
                                        className={cn(
                                            "p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 relative",
                                            isSelected
                                                ? "border-upca-blue bg-blue-50/50"
                                                : "border-gray-100 hover:border-gray-200 bg-white"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                            isSelected ? "bg-upca-blue text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                        )}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 leading-tight">{service.name}</p>
                                            <p className="text-sm text-upca-blue font-bold mt-1">${service.basePrice}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-4 right-4 w-6 h-6 bg-upca-blue rounded-full flex items-center justify-center text-white">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled={selectedServices.length === 0}
                                onClick={() => setStep(3)}
                                className="flex-1 px-8 py-4 bg-upca-blue text-white rounded-2xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 disabled:opacity-50 disabled:shadow-none transition-all"
                            >
                                Continue to Scheduling
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Schedule & Finalize */}
                {step === 3 && (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Schedule & Notes</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Shoot Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                                    value={shootDate}
                                    onChange={(e) => setShootDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Additional Instructions</label>
                                <textarea
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all min-h-[120px]"
                                    placeholder="Access codes, specific shots you want, etc..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Order Summary</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Property</span>
                                <span className="font-bold text-gray-900">{selectedProperty?.address}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Services</span>
                                <span className="font-bold text-gray-900 text-right">{selectedServices.join(', ')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Date</span>
                                <span className="font-bold text-gray-900">{shootDate || 'Not selected'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                <span className="font-bold text-gray-900">Estimated Total</span>
                                <span className="text-xl font-black text-upca-blue">${calculateTotal()}</span>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-8 py-4 bg-upca-blue text-white rounded-2xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Confirming...' : 'Continue to Payment'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Payment */}
                {step === 4 && (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Payment Methods */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900">Select Payment Method</h3>

                                {isLoadingPaymentMethods ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-upca-blue" />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setSelectedPaymentMethod(method.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                                                    selectedPaymentMethod === method.id
                                                        ? "border-upca-blue bg-blue-50/50"
                                                        : "border-gray-100 hover:border-gray-200 bg-white"
                                                )}
                                            >
                                                <div className={cn("w-12 h-8 rounded flex items-center justify-center text-white font-bold text-[10px] uppercase", method.brandColor)}>
                                                    {method.type}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900">•••• {method.last4}</p>
                                                    <p className="text-xs text-gray-500">Expires {method.expiry}</p>
                                                </div>
                                                {selectedPaymentMethod === method.id && (
                                                    <div className="w-6 h-6 bg-upca-blue rounded-full flex items-center justify-center text-white">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/billing/payment-methods')}
                                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 font-bold hover:border-upca-blue hover:text-upca-blue transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add New Card
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Order Total */}
                            <div className="bg-gray-50 p-6 rounded-3xl h-fit">
                                <h3 className="font-bold text-gray-900 mb-4">Total Due Now</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-900">${calculateTotal()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Tax (13%)</span>
                                        <span className="font-bold text-gray-900">${(calculateTotal() * 0.13).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <span className="font-bold text-gray-900 text-lg">Total</span>
                                        <span className="text-2xl font-black text-upca-blue">${(calculateTotal() * 1.13).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 bg-white p-3 rounded-xl border border-gray-100">
                                    <Lock className="w-3 h-3" />
                                    Payments are secure and encrypted.
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !selectedPaymentMethod}
                                    className="w-full py-4 bg-upca-blue text-white rounded-2xl font-bold shadow-lg shadow-upca-blue/20 hover:bg-upca-blue/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Pay & Confirm Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

