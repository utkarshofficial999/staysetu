import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Home, IndianRupee, X, Check } from 'lucide-react';
import { databases, DATABASE_ID, COLLECTION, Query } from '../lib/appwrite';
import PropertyCard from '../components/common/PropertyCard';

const Listings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [propertyType, setPropertyType] = useState(searchParams.get('type') || 'all');
    const [genderFilter, setGenderFilter] = useState(searchParams.get('gender') || 'all');
    const [priceRange, setPriceRange] = useState(parseInt(searchParams.get('price')) || 100000);
    const [amenities, setAmenities] = useState(searchParams.get('amenities')?.split(',') || []);
    const [userCoords, setUserCoords] = useState(
        searchParams.get('lat') && searchParams.get('lng')
            ? { lat: parseFloat(searchParams.get('lat')), lng: parseFloat(searchParams.get('lng')) }
            : null
    );

    const amenityOptions = ['WiFi', 'AC', 'Food', 'Parking', 'Laundry'];

    // Haversine formula to calculate distance in KM
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const fetchListings = async () => {
        setLoading(true);

        try {
            // Build query filters
            const queries = [
                Query.equal('status', 'approved'),
                Query.orderDesc('$createdAt'),
                Query.limit(100),
            ];

            if (propertyType !== 'all') {
                queries.push(Query.equal('type', propertyType));
            }

            const res = await databases.listDocuments(DATABASE_ID, COLLECTION.listings, queries);

            let results = res.documents;

            // Client-side filtering for search, price, amenities, gender
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                results = results.filter(l =>
                    (l.title || '').toLowerCase().includes(q) ||
                    (l.location || '').toLowerCase().includes(q)
                );
            }

            results = results.filter(l => (l.price || 0) <= priceRange);

            if (amenities.length > 0) {
                results = results.filter(l => {
                    const listingAmenities = typeof l.amenities === 'string' ? JSON.parse(l.amenities) : (l.amenities || []);
                    return amenities.every(a => listingAmenities.includes(a));
                });
            }

            if (genderFilter !== 'all') {
                const genderValue = genderFilter === 'male' ? 'boys' : 'girls';
                results = results.filter(l =>
                    l.genderPreference === genderValue || l.genderPreference === 'any' || !l.genderPreference
                );
            }

            // Distance sorting
            if (userCoords) {
                results = results.map(l => {
                    const lat = parseFloat(l.latitude);
                    const lng = parseFloat(l.longitude);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        return { ...l, distance: getDistance(userCoords.lat, userCoords.lng, lat, lng) };
                    }
                    return { ...l, distance: Infinity };
                });
                results.sort((a, b) => a.distance - b.distance);
            }

            setListings(results);
        } catch (err) {
            console.error('Fetch listings error:', err);
        }
        setLoading(false);
    };

    // Re-fetch when search params or internal state changes
    useEffect(() => {
        fetchListings();
        // Sync URL (de-bounced manually via useEffect)
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (propertyType !== 'all') params.set('type', propertyType);
        if (genderFilter !== 'all') params.set('gender', genderFilter);
        if (priceRange < 100000) params.set('price', priceRange);
        if (amenities.length > 0) params.set('amenities', amenities.join(','));
        if (userCoords) {
            params.set('lat', userCoords.lat);
            params.set('lng', userCoords.lng);
        }
        setSearchParams(params, { replace: true });
    }, [searchQuery, propertyType, genderFilter, priceRange, amenities, userCoords]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        fetchListings();
    };

    const toggleAmenity = (amenity) => {
        const newAmenities = amenities.includes(amenity)
            ? amenities.filter(a => a !== amenity)
            : [...amenities, amenity];
        setAmenities(newAmenities);
    };

    const FilterPanel = ({ className = '' }) => (
        <div className={className}>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>Filters</h3>
                <button
                    onClick={() => {
                        setSearchQuery('');
                        setPropertyType('all');
                        setGenderFilter('all');
                        setPriceRange(100000);
                        setAmenities([]);
                        setUserCoords(null);
                        setSearchParams({});
                    }}
                    className="text-blue-900 text-xs font-semibold hover:text-blue-900 transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Property Type */}
            <div className="mb-8">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Type</label>
                <div className="space-y-1.5">
                    {['all', 'PG', 'Flat', 'Hostel'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setPropertyType(type)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-sm font-medium ${propertyType === type
                                ? 'border-blue-200 bg-blue-50 text-blue-900 shadow-sm'
                                : 'border-transparent text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <span>{type === 'all' ? 'Any Type' : type}</span>
                            {propertyType === type && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gender Preference */}
            <div className="mb-8">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Gender</label>
                <div className="space-y-1.5">
                    {[{ key: 'all', label: 'Any' }, { key: 'male', label: 'Boys' }, { key: 'female', label: 'Girls' }].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setGenderFilter(key)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-sm font-medium ${genderFilter === key
                                ? 'border-blue-200 bg-blue-50 text-blue-900 shadow-sm'
                                : 'border-transparent text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <span>{label}</span>
                            {genderFilter === key && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Price</label>
                    <span className="text-slate-900 font-black flex items-center text-sm" style={{ fontFamily: 'Bungee' }}>
                        <IndianRupee size={14} className="mr-0.5" />
                        {priceRange.toLocaleString()}
                    </span>
                </div>
                <input
                    type="range"
                    min="2000"
                    max="100000"
                    step="500"
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                />
                <div className="flex justify-between mt-2 text-[10px] font-medium text-slate-400">
                    <span>₹2,000</span>
                    <span>₹100,000+</span>
                </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Amenities</label>
                <div className="space-y-2">
                    {amenityOptions.map((amenity) => (
                        <label key={amenity} className="flex items-center space-x-2.5 cursor-pointer group">
                            <div
                                onClick={() => toggleAmenity(amenity)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${amenities.includes(amenity)
                                    ? 'bg-blue-500 border-blue-500 shadow-md'
                                    : 'border-slate-200 group-hover:border-slate-300'
                                    }`}
                            >
                                {amenities.includes(amenity) && <Check size={12} className="text-white" />}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${amenities.includes(amenity) ? 'text-slate-900' : 'text-slate-500'}`}>
                                {amenity}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                onClick={() => { fetchListings(); setShowFilters(false); }}
                className="w-full btn-primary py-3 text-sm"
            >
                Apply Filters
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-surface pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Bungee' }}>Explore Stays</h1>
                        <p className="text-slate-400 font-normal text-sm">
                            {userCoords ? `Showing properties near your location` : `Discover ${listings.length} verified properties for you`}
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex-1 md:max-w-sm group">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-900 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search by area, college..."
                                className="input-field pl-10 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </form>

                    <button
                        onClick={() => setShowFilters(true)}
                        className="md:hidden btn-secondary flex items-center justify-center space-x-2 py-3"
                    >
                        <SlidersHorizontal size={16} />
                        <span className="text-sm">Filters</span>
                    </button>
                </div>

                {userCoords && (
                    <div className="flex items-center gap-3 mb-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-fade-in">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                            <MapPin size={18} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Location Filter Active</h4>
                            <p className="text-[11px] text-emerald-600 font-medium">Showing properties sorted by proximity to you</p>
                        </div>
                        <button
                            onClick={() => {
                                setUserCoords(null);
                                const params = new URLSearchParams(searchParams);
                                params.delete('lat');
                                params.delete('lng');
                                setSearchParams(params);
                            }}
                            className="px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm"
                        >
                            Clear Location
                        </button>
                    </div>
                )}

                <div className="flex gap-8">
                    {/* Desktop Filters */}
                    <div className="hidden md:block w-60 shrink-0">
                        <FilterPanel className="card-elevated p-6 sticky top-24" />
                    </div>

                    {/* Listings Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-slate-50 rounded-3xl animate-pulse" style={{ height: 380, border: '1px solid rgba(0,0,0,0.04)' }}></div>
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                {listings.map((listing) => (
                                    <PropertyCard key={listing.id} property={listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="card-elevated rounded-[2rem] p-20 text-center border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-400">
                                    <Home size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Bungee' }}>No properties found</h3>
                                <p className="text-slate-400 font-normal mb-8 max-w-sm mx-auto text-sm">
                                    Try adjusting your filters or search query to find more options.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setPropertyType('all');
                                        setGenderFilter('all');
                                        setPriceRange(100000);
                                        setAmenities([]);
                                        setSearchParams({});
                                    }}
                                    className="btn-secondary text-sm"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-[100] bg-white animate-fade-in md:hidden">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <FilterPanel />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Listings;
