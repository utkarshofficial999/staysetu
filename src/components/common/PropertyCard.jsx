import React, { useState } from 'react';
import { MapPin, IndianRupee, Star, Heart, ImageOff, Wifi, Wind, UtensilsCrossed, Car, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { parseJsonField } from '../../lib/appwrite';
import { useAuth } from '../../context/AuthContext';
import { trackWhatsAppClick, openWhatsApp } from '../../lib/whatsappTracker';

const FALLBACKS = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
];

const amenityIcons = { WiFi: Wifi, AC: Wind, Food: UtensilsCrossed, Parking: Car };

const typeStyles = {
    PG: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    Flat: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    Hostel: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
};

const PropertyCard = ({ property }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeImage, setActiveImage] = useState(0);
    const [imgError, setImgError] = useState(false);
    const [liked, setLiked] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const images = parseJsonField(property?.images) || [];
    const fallback = FALLBACKS[((property?.$id || property?.id || '').charCodeAt(0) || 0) % FALLBACKS.length];

    const getImgSrc = (index) => {
        const src = images[index];
        return (!src || (index === activeImage && imgError)) ? fallback : src;
    };

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = (e) => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) nextImage(e);
        if (isRightSwipe) prevImage(e);
    };

    const handleWhatsAppClick = (e) => {
        e.preventDefault();

        // Require sign in
        if (!user) {
            navigate('/login');
            return;
        }

        const messageText = `Hi, I found your listing "${property?.title}" on StaySetu. Is it available?`;
        const message = encodeURIComponent(messageText);
        const number = property?.whatsappNumber || property?.phoneNumber || property?.phone_number || property?.owner_phone;

        // Track the click (fire-and-forget)
        trackWhatsAppClick({
            phoneNumber: number || '',
            listingId: property?.$id || property?.id || '',
            listingTitle: property?.title || '',
            ownerName: '',
            clickerUserId: '',
            clickerName: '',
            clickerEmail: '',
            source: 'property_card',
            message: messageText,
        });

        openWhatsApp(number, message);
    };

    return (
        <div className="group relative flex flex-col bg-white rounded-[2.5rem] border-2 border-slate-900 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
            {/* Image Container */}
            <div
                className="relative aspect-[4/3] overflow-hidden bg-slate-100"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-20 scale-110"
                    style={{ backgroundImage: `url(${getImgSrc(activeImage)})` }}
                ></div>
                <img
                    src={getImgSrc(activeImage)}
                    alt={property?.title || 'Property'}
                    className="relative w-full h-full object-contain z-10 transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={() => setImgError(true)}
                />

                {/* Gallery Navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all border border-slate-200"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all border border-slate-200"
                        >
                            <ChevronRight size={14} />
                        </button>

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1 px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm">
                            {images.slice(0, 5).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${activeImage === i ? 'bg-white w-3' : 'bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40 z-20"></div>

                {/* Type Tag - Floating Top Left */}
                <div className={`absolute top-4 left-4 z-40 px-3 py-1 rounded-full border-2 border-slate-900 bg-white text-slate-900 text-[9px] font-black uppercase tracking-widest shadow-[3px_3px_0px_#0f172a]`}>
                    {property?.type || 'PG'}
                </div>

                {/* Like Button */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
                    className={`absolute top-4 right-4 z-40 w-9 h-9 rounded-full border-2 border-slate-900 flex items-center justify-center transition-all duration-300 ${liked
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-slate-900 hover:bg-slate-900 hover:text-white'
                        }`}
                >
                    <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                </button>

                {/* Floating Price Tag */}
                <div className="absolute bottom-4 right-4 z-40 bg-slate-900 text-white px-3.5 py-2 rounded-xl border-2 border-slate-900 shadow-lg">
                    <div className="flex items-center gap-0.5">
                        <IndianRupee size={12} className="text-white" />
                        <span className="text-base font-bold" style={{ fontFamily: 'Bungee' }}>{property?.price?.toLocaleString() || '8,500'}</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 pt-6 flex flex-col flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-3">
                    <div className="flex items-center text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                        <Star size={10} fill="currentColor" className="mr-1" />
                        4.8
                    </div>
                    {(property?.genderPreference || property?.gender_preference || property?.gender) && (
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 uppercase`}>
                            {property.genderPreference || property.gender_preference || property.gender} only
                        </div>
                    )}
                    {/* Owner / Broker tag — always shown */}
                    {String(property?.listedBy || 'owner').toLowerCase() === 'owner' ? (
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                            Owner
                        </div>
                    ) : (
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 uppercase tracking-wide">
                            Broker
                        </div>
                    )}
                    {/* Fee tag — always shown */}
                    {String(property?.listedBy || 'owner').toLowerCase() === 'owner' ? (
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 uppercase tracking-wide">
                            No Brokerage
                        </div>
                    ) : (
                        <div className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-100 bg-amber-50 text-amber-600 uppercase tracking-wide">
                            Broker Fees
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'Bungee' }}>
                    {property?.title || 'Comfortable Stay'}
                </h3>

                <div className="flex items-center text-slate-500 text-sm font-medium mb-3">
                    <MapPin size={14} className="text-slate-400 mr-1.5 shrink-0" />
                    <span className="truncate">{property?.location || 'Greater Noida'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                    {(parseJsonField(property?.occupancy) || ['single']).map((occ, idx) => {
                        const isObj = typeof occ === 'object' && occ !== null;
                        const label = isObj ? occ.type : occ;
                        const price = isObj ? occ.price : null;
                        
                        return (
                            <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 uppercase flex items-center gap-1">
                                {label.replace('-', ' ')}
                                {price && price > 0 && (
                                    <span className="text-slate-400 font-bold ml-1 flex items-center">
                                        ₹{price.toLocaleString()}
                                    </span>
                                )}
                            </span>
                        );
                    })}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link
                        to={`/property/${property?.$id || property?.id || '123'}`}
                        className="bg-slate-900 text-white py-3 px-4 rounded-xl text-center text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        View More
                    </Link>
                    <button
                        onClick={handleWhatsAppClick}
                        className="border-2 border-slate-900 text-slate-900 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                        Contact Us
                    </button>
                </div>
            </div>
        </div >
    );
};

export default PropertyCard;

