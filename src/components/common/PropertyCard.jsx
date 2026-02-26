import React, { useState } from 'react';
import { MapPin, IndianRupee, Star, Heart, ImageOff, Wifi, Wind, UtensilsCrossed, Car, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACKS = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
];

const amenityIcons = { WiFi: Wifi, AC: Wind, Food: UtensilsCrossed, Parking: Car };

const typeStyles = {
    PG: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    Flat: { bg: 'bg-plum-50', text: 'text-plum-600', border: 'border-plum-200' },
    Hostel: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
};

const PropertyCard = ({ property }) => {
    const [imgError, setImgError] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [liked, setLiked] = useState(false);

    const fallback = FALLBACKS[(property?.id?.charCodeAt(0) || 0) % FALLBACKS.length];
    const rawSrc = property?.images?.[0];
    const imgSrc = (!rawSrc || imgError) ? fallback : rawSrc;
    const ts = typeStyles[property?.type] || typeStyles.PG;

    return (
        <div className="group relative flex flex-col bg-white rounded-[2rem] border-2 border-slate-900 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
            {/* Image Container */}
            <div className="relative aspect-[16/11] overflow-hidden">
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
                        <ImageOff size={24} className="text-slate-300" />
                    </div>
                )}
                <img
                    src={imgSrc}
                    alt={property?.title || 'Property'}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => { setImgError(true); setImgLoaded(true); }}
                />

                {/* Type Tag - Floating Top Left */}
                <div className={`absolute top-4 left-4 z-10 px-4 py-1.5 rounded-full border-2 border-slate-900 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_#0f172a]`}>
                    {property?.type || 'PG'}
                </div>

                {/* Like Button */}
                <button
                    onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
                    className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center transition-all duration-300 ${liked
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-900 hover:text-white'
                        }`}
                >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                </button>

                {/* Floating Price Tag - Overlaps Image and Content */}
                <div className="absolute bottom-0 right-6 translate-y-1/2 z-20 bg-slate-900 text-white px-5 py-3 rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-0.5">
                        <IndianRupee size={16} className="text-white" />
                        <span className="text-xl font-bold" style={{ fontFamily: 'Bungee' }}>{property?.price?.toLocaleString() || '8,500'}</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 pt-10 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                        <Star size={10} fill="currentColor" className="mr-1" />
                        4.8
                    </div>
                    {property?.gender && (
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 uppercase`}>
                            {property.gender} only
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-plum-600 transition-colors" style={{ fontFamily: 'Bungee' }}>
                    {property?.title || 'Comfortable Stay'}
                </h3>

                <div className="flex items-center text-slate-500 text-sm font-medium mb-6">
                    <MapPin size={14} className="text-slate-400 mr-1.5 shrink-0" />
                    <span className="truncate">{property?.location || 'Greater Noida'}</span>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link
                        to={`/property/${property?.id || '123'}`}
                        className="bg-slate-900 text-white py-3 px-4 rounded-xl text-center text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        View More
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const message = encodeURIComponent(`Hi, I found your listing "${property?.title}" on StaySetu. Is it available?`);
                            window.open(`https://wa.me/${property?.whatsapp_number || property?.phone_number || property?.owner_phone}?text=${message}`, '_blank');
                        }}
                        className="border-2 border-slate-900 text-slate-900 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                        Contact Us
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
