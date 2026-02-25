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
    PG: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    Flat: { bg: 'bg-plum-500/10', text: 'text-plum-300', border: 'border-plum-500/20' },
    Hostel: { bg: 'bg-plum-400/10', text: 'text-plum-200', border: 'border-plum-400/20' },
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
        <div className="group card-elevated overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 animate-pulse flex items-center justify-center">
                        <ImageOff size={24} className="text-slate-700" />
                    </div>
                )}

                <img
                    src={imgSrc}
                    alt={property?.title || 'Property'}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => { setImgError(true); setImgLoaded(true); }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Type badge */}
                <div className={`absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg ${ts.bg} ${ts.text} border ${ts.border} backdrop-blur-md`}>
                    {property?.type || 'PG'}
                </div>

                {/* Verified badge */}
                <div className="absolute top-3 right-12 bg-emerald-500/80 backdrop-blur-md text-white text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-500/20">
                    <CheckCircle2 size={9} /> Verified
                </div>

                {/* Wishlist */}
                <button
                    onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${liked
                        ? 'bg-red-500 text-white shadow-glow-red'
                        : 'bg-black/40 backdrop-blur-md text-slate-300 hover:text-white hover:bg-black/60 border border-white/10'
                        }`}
                >
                    <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                </button>

                {/* Rating on hover */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/5">
                    <Star size={11} fill="currentColor" className="text-amber-400" />
                    <span>4.8</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-white line-clamp-1 text-sm group-hover:text-plum-300 transition-colors" style={{ fontFamily: 'Space Grotesk' }}>
                        {property?.title || 'Comfortable Stay'}
                    </h3>
                    <div className="flex items-center text-white font-black text-[10px] shrink-0 bg-white/10 px-2 py-0.5 rounded-md border border-white/40 shadow-[0_0_5px_rgba(255,255,255,0.1)]">
                        <Star size={9} fill="#fbbf24" className="mr-0.5 text-amber-400" />
                        4.8
                    </div>
                </div>

                <div className="flex items-center text-slate-400 text-xs font-normal mb-4 gap-1">
                    <MapPin size={11} className="text-plum-400 shrink-0" />
                    <span className="line-clamp-1 group-hover:text-slate-300 transition-colors">{property?.location || 'Greater Noida'}</span>
                </div>

                {/* Amenity chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {(property?.amenities?.slice(0, 3) || []).map((amenity, i) => {
                        const Icon = amenityIcons[amenity];
                        return (
                            <span key={i} className="flex items-center gap-1.5 text-[10px] font-medium bg-white/5 text-slate-300 border border-white/20 px-2.5 py-1 rounded-md">
                                {Icon && <Icon size={9} />}
                                {amenity}
                            </span>
                        );
                    })}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-white/10 mt-auto">
                    <div>
                        <div className="flex items-center text-white font-black text-lg" style={{ fontFamily: 'Space Grotesk' }}>
                            <IndianRupee size={16} className="mr-0.5 text-white" />
                            {property?.price?.toLocaleString() || '8,500'}
                        </div>
                        <span className="text-slate-500 text-[10px] font-medium">/month</span>
                    </div>
                    <Link
                        to={`/property/${property?.id || '123'}`}
                        className="btn-primary py-2 px-5 text-[11px] font-bold"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
