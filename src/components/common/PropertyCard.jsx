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
    PG: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    Flat: { bg: 'bg-plum-50', text: 'text-plum-900', border: 'border-plum-100' },
    Hostel: { bg: 'bg-plum-100', text: 'text-plum-700', border: 'border-plum-200' },
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
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse flex items-center justify-center">
                        <ImageOff size={24} className="text-slate-200" />
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Type badge */}
                <div className={`absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg ${ts.bg} ${ts.text} border ${ts.border}`}>
                    {property?.type || 'PG'}
                </div>

                {/* Verified badge */}
                <div className="absolute top-3 right-12 bg-emerald-500/90 backdrop-blur-sm text-white text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle2 size={9} /> Verified
                </div>

                {/* Wishlist */}
                <button
                    onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${liked
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white'
                        }`}
                >
                    <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                </button>

                {/* Rating on hover */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Star size={11} fill="currentColor" className="text-amber-400" />
                    <span>4.8</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1 text-sm" style={{ fontFamily: 'Space Grotesk' }}>
                        {property?.title || 'Comfortable Stay'}
                    </h3>
                    <div className="flex items-center text-amber-500 font-semibold text-[10px] shrink-0 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        <Star size={9} fill="currentColor" className="mr-0.5" />
                        4.8
                    </div>
                </div>

                <div className="flex items-center text-slate-400 text-xs font-normal mb-3 gap-1">
                    <MapPin size={11} className="text-plum-400 shrink-0" />
                    <span className="line-clamp-1">{property?.location || 'Greater Noida'}</span>
                </div>

                {/* Amenity chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {(property?.amenities?.slice(0, 3) || []).map((amenity, i) => {
                        const Icon = amenityIcons[amenity];
                        return (
                            <span key={i} className="flex items-center gap-1 text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-100 px-2 py-1 rounded-md">
                                {Icon && <Icon size={9} />}
                                {amenity}
                            </span>
                        );
                    })}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 mt-auto">
                    <div>
                        <div className="flex items-center text-plum-900 font-bold text-base" style={{ fontFamily: 'Space Grotesk' }}>
                            <IndianRupee size={14} className="mr-0.5" />
                            {property?.price?.toLocaleString() || '8,500'}
                        </div>
                        <span className="text-slate-400 text-[10px] font-normal">/month</span>
                    </div>
                    <Link
                        to={`/property/${property?.id || '123'}`}
                        className="btn-primary py-2 px-4 text-[11px]"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
