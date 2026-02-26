import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, IndianRupee, Wifi, Wind, Coffee, Car, Home,
    ChevronLeft, ChevronRight, Phone,
    CheckCircle2, AlertCircle, Share2, Heart, MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PropertyDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('Listing fetch error:', error.message);
                    setLoading(false);
                    return;
                }

                if (data) {
                    if (data.owner_id) {
                        const { data: ownerData } = await supabase
                            .from('profiles')
                            .select('id, full_name')
                            .eq('id', data.owner_id)
                            .single();

                        data.owner = ownerData
                            ? { ...ownerData, name: ownerData.full_name || 'Owner' }
                            : { name: 'Owner' };
                    }
                    setProperty(data);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProperty();
    }, [id]);

    const initiateWhatsApp = () => {
        const message = encodeURIComponent(`Hi, I found your listing "${property.title}" on StaySetu. Is it available?`);
        window.open(`https://wa.me/${property.whatsapp_number || property.phone_number}?text=${message}`, '_blank');
    };

    const handleMessage = () => {
        if (!user) {
            navigate('/login', { state: { from: `/property/${id}` } });
            return;
        }
        navigate(`/messages?id=${property.owner_id}&listing=${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-3 border-slate-900 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,0,0,0.1)]"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen pt-32 text-center bg-white px-4">
                <div className="card-elevated max-w-md mx-auto p-12 rounded-[2rem]">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="text-red-500" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Bungee' }}>Property not found</h2>
                    <p className="text-slate-400 text-sm mb-6">This listing may have been removed or is no longer available.</p>
                    <button onClick={() => navigate('/listings')} className="btn-primary text-sm">Back to Listings</button>
                </div>
            </div>
        );
    }

    const amenityIcons = {
        'WiFi': Wifi,
        'AC': Wind,
        'Food': Coffee,
        'Parking': Car,
    };

    return (
        <div className="min-h-screen bg-white pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation & Actions */}
                <div className="flex justify-between items-center mb-6 py-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary flex items-center gap-1.5 py-2 px-4 text-sm"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:flex chip-approved">
                            <CheckCircle2 size={10} className="mr-1" /> Verified
                        </span>
                        <button
                            onClick={() => setLiked(!liked)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${liked
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-red-500'
                                }`}
                        >
                            <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
                        </button>
                        <button className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all">
                            <Share2 size={15} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="relative rounded-3xl overflow-hidden bg-slate-100 group shadow-sm border border-slate-100" style={{ height: '500px' }}>
                            {/* Blurred Background Layer to fill empty space */}
                            <div
                                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
                                style={{ backgroundImage: `url(${property.images?.[activeImage] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'})` }}
                            ></div>

                            <img
                                src={property.images?.[activeImage] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'}
                                alt={property.title}
                                className="relative w-full h-full object-contain z-10"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80';
                                }}
                            />

                            {property.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setActiveImage((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    >
                                        <ChevronRight size={18} />
                                    </button>

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
                                        {property.images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImage(i)}
                                                className={`h-1.5 rounded-full transition-all ${activeImage === i ? 'bg-slate-900 w-6' : 'bg-slate-900/40 w-1.5'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Image counter */}
                            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-lg">
                                {activeImage + 1} / {property.images?.length || 1}
                            </div>
                        </div>

                        {/* Property Info */}
                        <div className="card-elevated p-6 md:p-8">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="chip-approved">
                                    <CheckCircle2 size={10} className="mr-1" /> Verified
                                </span>
                                {property.type && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-plum-50 text-plum-600 border border-plum-100">
                                        {property.type}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Bungee' }}>
                                {property.title}
                            </h1>
                            <div className="flex items-center text-slate-500 text-sm font-normal mb-6 gap-1.5">
                                <MapPin size={14} className="text-plum-400" />
                                {property.location}
                            </div>

                            <div className="h-px bg-slate-100 mb-6" />

                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Bungee' }}>About</h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                                    {property.description || "No description provided for this property. Contact the owner for more details."}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Bungee' }}>Amenities</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {property.amenities?.map((amenity) => {
                                        const Icon = amenityIcons[amenity] || Home;
                                        return (
                                            <div key={amenity} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-plum-600 border border-slate-200"
                                                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                                                    <Icon size={16} />
                                                </div>
                                                <span className="font-medium text-slate-700 text-sm">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card-elevated p-6 sticky top-24">
                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Starting from</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900 flex items-center" style={{ fontFamily: 'Bungee' }}>
                                        <IndianRupee size={22} className="mr-1" />
                                        {property.price?.toLocaleString()}
                                    </span>
                                    <span className="text-slate-500 font-normal text-sm">/ month</span>
                                </div>
                            </div>

                            {/* WhatsApp CTA */}
                            <button
                                onClick={initiateWhatsApp}
                                className="btn-whatsapp w-full py-3.5 justify-center text-sm mb-3"
                            >
                                <Phone size={17} />
                                Connect via WhatsApp
                            </button>
                            <p className="text-center text-[11px] text-slate-500 font-medium mb-6">⚡ Owner typically replies within 5 mins</p>

                            <div className="h-px bg-slate-100 mb-6" />

                            {/* Owner info */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-11 h-11 bg-gradient-to-br from-plum-600 to-plum-800 rounded-2xl flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                    {(property.owner?.name || 'O').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'Bungee' }}>
                                        {property.owner?.name || 'Property Owner'}
                                    </h4>
                                    <p className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Verified Owner
                                    </p>
                                </div>
                            </div>

                            {/* Owner quote */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 mb-6">
                                <p className="text-sm text-slate-600 leading-relaxed italic font-normal">
                                    "Hi, I'm {property.owner?.name || 'the owner'}. Feel free to reach out — I'll help you find the perfect stay!"
                                </p>
                            </div>

                            {/* Trust indicators */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {['No Brokerage', 'Safe & Verified', 'Direct Contact', 'Easy Move-in'].map((t) => (
                                    <div key={t} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                                        <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />{t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;
