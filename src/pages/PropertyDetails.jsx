import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, IndianRupee, Wifi, Wind, Coffee, Car, Home,
    ChevronLeft, ChevronRight, Phone,
    CheckCircle2, AlertCircle, Share2, Heart, MessageCircle, Users as UsersIcon, Pencil,
    Star, Trash2, Send
} from 'lucide-react';
import { databases, DATABASE_ID, COLLECTION, Query, ID, parseJsonField } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import PropertyMap from '../components/common/PropertyMap';
import { trackWhatsAppClick, openWhatsApp } from '../lib/whatsappTracker';

const PropertyDetails = () => {
    const { id } = useParams();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [liked, setLiked] = useState(false);
    const [error, setError] = useState(null);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [reviewError, setReviewError] = useState(null);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    // Minimum swipe distance in pixels
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && property?.images) {
            setActiveImage((prev) => (prev < property.images.length - 1 ? prev + 1 : 0));
        }
        if (isRightSwipe && property?.images) {
            setActiveImage((prev) => (prev > 0 ? prev - 1 : property.images.length - 1));
        }
    };

    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true);
            try {
                if (!id) throw new Error('No property ID provided');

                const data = await databases.getDocument(DATABASE_ID, COLLECTION.listings, id);

                if (data) {
                    if (data.ownerId) {
                        try {
                            const ownerRes = await databases.listDocuments(
                                DATABASE_ID,
                                COLLECTION.profiles,
                                [Query.equal('userId', data.ownerId)]
                            );

                            data.owner = ownerRes.documents.length > 0
                                ? {
                                    ...ownerRes.documents[0],
                                    id: ownerRes.documents[0].userId,
                                    name: ownerRes.documents[0].fullName || ownerRes.documents[0].name || 'Owner'
                                }
                                : { name: 'Owner' };
                        } catch (ownerErr) {
                            console.error('Owner fetch error:', ownerErr);
                            data.owner = { name: 'Owner' };
                        }
                    } else {
                        data.owner = { name: 'Owner' };
                    }

                    // Parse JSON fields safely
                    data.images = parseJsonField(data.images) || [];
                    data.amenities = parseJsonField(data.amenities) || [];
                    data.occupancy = parseJsonField(data.occupancy);
                    if (!Array.isArray(data.occupancy) || data.occupancy.length === 0) {
                        data.occupancy = ['single'];
                    }

                    setProperty(data);
                } else {
                    setError('Property not found');
                }
            } catch (err) {
                console.error('Property details error:', err);
                setError(err.message || 'Failed to load property');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    // Fetch reviews
    const fetchReviews = async () => {
        if (!id) return;
        setReviewsLoading(true);
        try {
            const res = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION.reviews,
                [Query.equal('listingId', id), Query.orderDesc('$createdAt'), Query.limit(50)]
            );
            setReviews(res.documents);
            if (user) {
                setHasReviewed(res.documents.some(r => r.userId === user.$id));
            }
        } catch (err) {
            console.error('Reviews fetch error:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, [id, user]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) { setReviewError('Please log in to write a review.'); return; }
        if (!reviewForm.comment.trim()) { setReviewError('Please write your review.'); return; }
        setSubmittingReview(true);
        setReviewError(null);
        try {
            await databases.createDocument(DATABASE_ID, COLLECTION.reviews, ID.unique(), {
                listingId: id,
                userId: user.$id,
                userName: profile?.fullName || profile?.name || user?.name || 'Anonymous',
                rating: reviewForm.rating,
                comment: reviewForm.comment.trim(),
                createdAt: new Date().toISOString(),
            });
            setReviewForm({ rating: 5, comment: '' });
            setReviewSuccess(true);
            setTimeout(() => setReviewSuccess(false), 3000);
            fetchReviews();
        } catch (err) {
            setReviewError('Failed to submit review. Please try again.');
            console.error(err);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION.reviews, reviewId);
            fetchReviews();
        } catch (err) {
            console.error('Delete review error:', err);
        }
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
        : null;

    const isAdmin = user && ['sudhansu@gmail.com', 'yutkarsh669@gmail.com', 'staysetu26@gmail.com'].includes(user.email);

    const handleShare = async () => {
        const shareData = {
            title: property?.title || 'StaySetu Property',
            text: `Check out this stay on StaySetu: ${property?.title}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Property link copied to clipboard!');
            }
        } catch (err) {
            console.error('Sharing error:', err);
        }
    };

    const initiateWhatsApp = () => {
        if (!user) {
            navigate('/login', { state: { from: `/property/${id}` } });
            return;
        }

        if (!property) return;

        const phoneNumber = property.whatsappNumber || property.phoneNumber || property.whatsapp_number || property.phone_number;
        const messageText = `Hi, I found your listing "${property.title}" on StaySetu. Is it available?`;
        const message = encodeURIComponent(messageText);

        trackWhatsAppClick({
            phoneNumber,
            listingId: property.$id || id,
            listingTitle: property.title || 'Property',
            ownerName: property.owner?.name || '',
            clickerUserId: user?.$id || '',
            clickerName: profile?.fullName || user?.name || '',
            clickerEmail: user?.email || '',
            source: 'property_details',
            message: messageText,
        });

        openWhatsApp(phoneNumber, message);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading StaySetu...</p>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen pt-32 text-center bg-white px-4">
                <div className="card-elevated max-w-md mx-auto p-12 rounded-[2rem]">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="text-red-500" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Bungee' }}>Listing Problem</h2>
                    <p className="text-slate-400 text-sm mb-6">{error || 'This listing may have been removed or is no longer available.'}</p>
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
                        <button
                            onClick={handleShare}
                            className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all"
                            title="Share property"
                        >
                            <Share2 size={15} />
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => navigate(`/dashboard/edit-listing/${id}`)}
                                className="w-9 h-9 bg-plum-50 border border-plum-100 rounded-xl flex items-center justify-center text-plum-600 hover:bg-plum-100 transition-all shadow-sm"
                                title="Edit Listing (Admin Only)"
                            >
                                <Pencil size={15} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div
                            className="relative rounded-3xl overflow-hidden bg-slate-100 group shadow-sm border border-slate-100"
                            style={{ height: '500px' }}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
                                style={{ backgroundImage: `url(${property.images?.[activeImage] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'})` }}
                            ></div>

                            <img
                                src={property.images?.[activeImage] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'}
                                alt={property.title || 'Property'}
                                className="relative w-full h-full object-contain z-10"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80';
                                }}
                            />

                            {Array.isArray(property.images) && property.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-30"
                                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setActiveImage((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-30"
                                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    >
                                        <ChevronRight size={18} />
                                    </button>

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full z-30">
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

                            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-lg z-30">
                                {activeImage + 1} / {property.images?.length || 1}
                            </div>
                        </div>

                        {/* Property Info */}
                        <div className="card-elevated p-6 md:p-8">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="chip-approved">
                                    <CheckCircle2 size={10} className="mr-1" /> Verified
                                </span>
                                {/* Owner / Broker badge */}
                                {String(property.listedBy || 'owner').toLowerCase() === 'owner' ? (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Owner
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-violet-50 text-violet-700 border-violet-200">
                                        Broker
                                    </span>
                                )}
                                {/* Fee tag — always shown */}
                                {String(property.listedBy || 'owner').toLowerCase() === 'owner' ? (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-sky-50 text-sky-700 border-sky-200">
                                        No Brokerage
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-amber-50 text-amber-600 border-amber-100">
                                        Broker Fees
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Bungee' }}>
                                {property.title || 'Property Details'}
                            </h1>
                            <div className="flex items-center text-slate-500 text-sm font-normal mb-6 gap-1.5">
                                <MapPin size={14} className="text-blue-400" />
                                {property.location || 'Location not specified'}
                            </div>

                            <div className="h-px bg-slate-100 mb-6" />

                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Bungee' }}>About</h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                                    {property.description || "No description provided for this property. Contact the owner for more details."}
                                </p>
                            </div>

                            <div className="mb-10">
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Bungee' }}>Amenities</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {(property.amenities || []).map((amenity) => {
                                        const Icon = amenityIcons[amenity] || Home;
                                        return (
                                            <div key={amenity} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-blue-600 border border-slate-200"
                                                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                                                    <Icon size={16} />
                                                </div>
                                                <span className="font-medium text-slate-700 text-sm">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mb-10">
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Bungee' }}>Available Room Types</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {(property.occupancy || []).map((occ, idx) => {
                                        const isObj = typeof occ === 'object' && occ !== null;
                                        const type = isObj ? occ.type : occ;
                                        const price = isObj ? occ.price : null;

                                        return (
                                            <div key={idx} className="flex flex-col gap-1 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
                                                        <UsersIcon size={16} />
                                                    </div>
                                                    <span className="font-bold text-emerald-700 text-xs uppercase tracking-tight">
                                                        {type === 'single' ? 'Single' : type === 'double' ? 'Double Sharing' : type === 'triple' ? 'Triple Sharing' : (type.replace('-', ' ') + ' Sharing')}
                                                    </span>
                                                </div>
                                                {price && price > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-emerald-100/50 flex items-center justify-between">
                                                        <span className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider">Rent</span>
                                                        <span className="font-black text-emerald-700 text-sm">₹{price.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Bungee' }}>Location</h3>
                                {property.latitude && property.longitude ? (
                                    <PropertyMap
                                        position={{ lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) }}
                                    />
                                ) : (
                                    <div className="p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                        <MapPin className="text-slate-300 mx-auto mb-3" size={32} />
                                        <p className="text-slate-500 text-sm font-medium">Exact map coordinates not provided by owner</p>
                                        <p className="text-slate-400 text-xs mt-1">Address: {property.location}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== REVIEWS SECTION (full width below) ===== */}
                    <div className="lg:col-span-3 mt-2">
                        <div className="card-elevated p-6 md:p-8">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>
                                        Reviews &amp; Ratings
                                    </h3>
                                    {avgRating ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex">
                                                {[1,2,3,4,5].map(s => (
                                                    <Star key={s} size={14} className={parseFloat(avgRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-100'} />
                                                ))}
                                            </div>
                                            <span className="font-black text-slate-900 text-sm">{avgRating}</span>
                                            <span className="text-slate-400 text-xs font-medium">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm mt-1">No reviews yet — be the first!</p>
                                    )}
                                </div>
                            </div>

                            {/* Write Review Form */}
                            {user && !hasReviewed && (
                                <form onSubmit={handleSubmitReview} className="bg-slate-50 rounded-2xl border border-slate-100 p-5 mb-8">
                                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Write a Review</h4>

                                    {/* Star Picker */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {[1,2,3,4,5].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}
                                                onMouseEnter={() => setHoverRating(s)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    size={28}
                                                    className={(hoverRating || reviewForm.rating) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-100'}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm font-bold text-slate-500">
                                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][(hoverRating || reviewForm.rating)]}
                                        </span>
                                    </div>

                                    <textarea
                                        rows={3}
                                        placeholder="Share your experience about this property..."
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 resize-none focus:outline-none focus:border-blue-400 transition-colors mb-3"
                                        value={reviewForm.comment}
                                        onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                        maxLength={500}
                                    />

                                    {reviewError && (
                                        <div className="flex items-center gap-2 text-red-500 text-xs font-semibold mb-3">
                                            <AlertCircle size={12} /> {reviewError}
                                        </div>
                                    )}
                                    {reviewSuccess && (
                                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold mb-3">
                                            <CheckCircle2 size={12} /> Review submitted! Thank you.
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400">{reviewForm.comment.length}/500</span>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                                        >
                                            {submittingReview ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Send size={13} />
                                            )}
                                            Submit Review
                                        </button>
                                    </div>
                                </form>
                            )}

                            {!user && (
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 text-center">
                                    <p className="text-sm font-semibold text-blue-700 mb-2">Sign in to write a review</p>
                                    <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all">
                                        Sign In
                                    </button>
                                </div>
                            )}

                            {hasReviewed && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    <p className="text-sm font-semibold text-emerald-700">You've already reviewed this property.</p>
                                </div>
                            )}

                            {/* Reviews List */}
                            {reviewsLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-10">
                                    <Star size={36} className="text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium text-sm">No reviews yet for this listing.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {reviews.map((review) => (
                                        <div key={review.$id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm relative">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                                                        {(review.userName || 'A').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{review.userName || 'Anonymous'}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(review.createdAt || review.$createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[1,2,3,4,5].map(s => (
                                                        <Star key={s} size={11} className={review.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed font-normal">{review.comment}</p>
                                            {/* Delete — own review or admin */}
                                            {(user && (review.userId === user.$id || isAdmin)) && (
                                                <button
                                                    onClick={() => handleDeleteReview(review.$id)}
                                                    className="absolute top-3 right-3 w-7 h-7 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                                                    title="Delete review"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                        {property.price?.toLocaleString() || 'N/A'}
                                    </span>
                                    <span className="text-slate-500 font-normal text-sm">/ month</span>
                                </div>
                            </div>

                            <button
                                onClick={initiateWhatsApp}
                                className="btn-whatsapp w-full py-3.5 justify-center text-sm mb-3"
                            >
                                <Phone size={17} />
                                Connect via WhatsApp
                            </button>
                            <p className="text-center text-[11px] text-slate-500 font-medium mb-6">⚡ {String(property.listedBy || 'owner').toLowerCase() === 'owner' ? 'Owner' : 'Broker'} typically replies within 5 mins</p>

                            <div className="h-px bg-slate-100 mb-6" />

                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                    {(property.owner?.name || 'O').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'Bungee' }}>
                                        {property.owner?.name || 'Property Owner'}
                                    </h4>
                                    <p className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Verified {String(property.listedBy || 'owner').toLowerCase() === 'owner' ? 'Owner' : 'Broker'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 mb-6">
                                <p className="text-sm text-slate-600 leading-relaxed italic font-normal">
                                    "Hi, I'm {property.owner?.name || (String(property.listedBy || 'owner').toLowerCase() === 'owner' ? 'the owner' : 'the broker')}. Feel free to reach out — I'll help you find the perfect stay!"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    String(property.listedBy || 'owner').toLowerCase() !== 'owner' ? 'Broker Fees' : 'No Brokerage',
                                    'Safe & Verified',
                                    'Direct Contact',
                                    'Easy Move-in'
                                ].map((t) => (
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
