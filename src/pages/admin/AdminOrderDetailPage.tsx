import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    User,
    CheckCircle,
    MessageSquare,
    Download,
    Edit,
    Globe,
    X,
    Plus
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { cn } from '../../services/utils';
import { useOrderStatusStore, useAssetsStore, type Asset } from '../../stores/servicesStore';

import { useNotification } from '../../contexts/NotificationContext';

export const AdminOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed' | 'paid'>('pending');

    const { updateOrderStatus: saveOrderStatus, getOrderStatus, updatePaymentStatus, getPaymentStatus } = useOrderStatusStore();
    const { addAsset, removeAsset, getOrderAssets } = useAssetsStore();
    const { showNotification } = useNotification();
    const [uploadUrl, setUploadUrl] = useState('');
    const [uploadingService, setUploadingService] = useState<string | null>(null);

    const handleAddAsset = (serviceName: string, type: Asset['type']) => {
        if (!order || !uploadUrl) return;

        addAsset(order.id, {
            id: Math.random().toString(36).substr(2, 9),
            type,
            name: type === 'link' ? 'Project Link' : `Asset for ${serviceName}`,
            url: uploadUrl,
            serviceId: serviceName
        });

        showNotification('Asset added successfully');
        setUploadUrl('');
        setUploadingService(null);
    };

    const assets = order ? getOrderAssets(order.id) : [];

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                const data = await api.getOrderById(id);
                if (data) {
                    const storedStatus = getOrderStatus(data.id);
                    if (storedStatus) {
                        data.status = storedStatus;
                    }

                    const storedPayment = getPaymentStatus(data.id);
                    if (storedPayment) {
                        setPaymentStatus(storedPayment);
                    }

                    setOrder(data);
                } else {
                    setOrder(null);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, getOrderStatus, getPaymentStatus]);

    const handleStatusChange = (newStatus: OrderStatus) => {
        if (order) {
            setOrder({ ...order, status: newStatus });
            // Save to store for real-time sync with client dashboard
            saveOrderStatus(order.id, newStatus);
            showNotification(`Order status updated to ${newStatus}`);
        }
    };

    const handleConfirmPayment = () => {
        if (order) {
            setPaymentStatus('confirmed');
            updatePaymentStatus(order.id, 'confirmed');
            showNotification('Payment status updated to Confirmed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-upca-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Order not found</p>
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="mt-4 text-upca-blue font-bold hover:underline"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const statusOptions: OrderStatus[] = ['Draft', 'Scheduled', 'In Progress', 'Editing', 'Delivered', 'Archived'];

    const clientViewMapping: Record<string, string> = {
        'Draft': 'Draft',
        'Scheduled': 'Shoot Booked',
        'In Progress': 'On Site',
        'Editing': 'Post-Production',
        'Delivered': 'Media Ready',
        'Archived': 'Archived'
    };

    const totalPrice = order.services.length * 350; // Mock calculation

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                    <p className="text-gray-500 mt-1">Manage order details and status</p>
                </div>
                <button
                    onClick={() => navigate(`/admin/messages?orderId=${order.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-upca-blue text-white rounded-xl font-semibold hover:bg-upca-blue/90 transition-colors"
                >
                    <MessageSquare className="w-4 h-4" />
                    Message Client
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Property Info */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Property Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-bold text-gray-900">{order.propertyAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Agent</p>
                                    <p className="font-bold text-gray-900">{order.agentName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Shoot Date</p>
                                    <p className="font-bold text-gray-900">{order.shootDate}</p>
                                    <p className="text-sm text-gray-500 mt-1">10:00 AM - 11:30 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Services & Deliverables</h2>
                        <div className="space-y-6">
                            {order.services.map((service, index) => {
                                const serviceAssets = assets.filter(a => a.serviceId === service);
                                const isMicrosite = service.includes('Microsite') || service.includes('Website');
                                const isUploadOpen = uploadingService === service;

                                return (
                                    <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-upca-blue/10 flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-upca-blue" />
                                                </div>
                                                <span className="font-medium text-gray-900">{service}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">$350</span>
                                        </div>

                                        {/* Asset List */}
                                        {serviceAssets.length > 0 && (
                                            <div className="pl-14 space-y-2">
                                                {serviceAssets.map(asset => (
                                                    <div key={asset.id} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-gray-200">
                                                        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                                            {asset.type === 'link' ? <Globe className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                                            {asset.name}
                                                        </a>
                                                        <button
                                                            onClick={() => removeAsset(order.id, asset.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload Action */}
                                        <div className="pl-14">
                                            {isUploadOpen ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={isMicrosite ? "https://site.com" : "https://dropbox.com/dates..."}
                                                        value={uploadUrl}
                                                        onChange={(e) => setUploadUrl(e.target.value)}
                                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-upca-blue"
                                                    />
                                                    <button
                                                        onClick={() => handleAddAsset(service, isMicrosite ? 'link' : 'other')}
                                                        className="px-3 py-2 bg-upca-blue text-white text-sm rounded-lg hover:bg-upca-blue/90"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setUploadingService(null);
                                                            setUploadUrl('');
                                                        }}
                                                        className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setUploadingService(service)}
                                                    className="text-sm text-upca-blue font-bold hover:underline flex items-center gap-1"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    {isMicrosite ? 'Set Website URL' : 'Add Download Link'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="text-2xl font-black text-upca-blue">${totalPrice}</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Timeline</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                </div>
                                <div className="flex-1 pb-6">
                                    <p className="font-bold text-gray-900">Order Created</p>
                                    <p className="text-sm text-gray-500">{order.createdAt}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center",
                                        order.status !== 'Draft' ? "bg-emerald-100" : "bg-gray-100"
                                    )}>
                                        <CheckCircle className={cn(
                                            "w-4 h-4",
                                            order.status !== 'Draft' ? "text-emerald-600" : "text-gray-400"
                                        )} />
                                    </div>
                                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                </div>
                                <div className="flex-1 pb-6">
                                    <p className="font-bold text-gray-900">Scheduled</p>
                                    <p className="text-sm text-gray-500">Shoot date confirmed</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center",
                                        order.status === 'Delivered' ? "bg-emerald-100" : "bg-gray-100"
                                    )}>
                                        <CheckCircle className={cn(
                                            "w-4 h-4",
                                            order.status === 'Delivered' ? "text-emerald-600" : "text-gray-400"
                                        )} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">Delivered</p>
                                    <p className="text-sm text-gray-500">Files ready for download</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Management */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-upca-blue/20 focus:border-upca-blue outline-none"
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status} {clientViewMapping[status] !== status ? `(Client: ${clientViewMapping[status]})` : ''}
                                </option>
                            ))}
                        </select>
                        <button className="w-full mt-3 px-4 py-3 bg-upca-blue text-white rounded-xl font-semibold hover:bg-upca-blue/90 transition-colors">
                            Update Status
                        </button>
                    </div>

                    {/* Payment Management */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Payment Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-600">Amount Due</span>
                                <span className="font-bold text-gray-900">${totalPrice}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-600">Status</span>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold",
                                    paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-700" :
                                        paymentStatus === 'confirmed' ? "bg-blue-100 text-blue-700" :
                                            "bg-orange-100 text-orange-700"
                                )}>
                                    {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                                </span>
                            </div>
                        </div>
                        {paymentStatus === 'pending' && (
                            <button
                                onClick={handleConfirmPayment}
                                className="w-full mt-4 px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Confirm Payment
                            </button>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium text-gray-700 transition-colors">
                                <Download className="w-4 h-4" />
                                Download Invoice
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium text-gray-700 transition-colors">
                                <Edit className="w-4 h-4" />
                                Edit Order Details
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium text-gray-700 transition-colors">
                                <MessageSquare className="w-4 h-4" />
                                Send Update to Client
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
