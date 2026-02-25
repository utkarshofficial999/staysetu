import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Home, IndianRupee, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PropertyCard from '../components/common/PropertyCard';

const Listings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [propertyType, setPropertyType] = useState(searchParams.get('type') || 'all');
    const [genderFilter, setGenderFilter] = useState(searchParams.get('gender') || 'all');
    const [priceRange, setPriceRange] = useState(100000);
    const [amenities, setAmenities] = useState([]);

    const amenityOptions = ['WiFi', 'AC', 'Food', 'Parking', 'Laundry'];

    const fetchListings = async () => {
        setLoading(true);
        let query = supabase
            .from('listings')
            .select('*')
            .eq('status', 'approved');

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
        }

        if (propertyType !== 'all') {
            query = query.eq('type', propertyType);
        }

        query = query.lte('price', priceRange);

        if (amenities.length > 0) {
            query = query.contains('amenities', amenities);
        }

        if (genderFilter !== 'all') {
            const genderValue = genderFilter === 'male' ? 'boys' : 'girls';
            query = query.or(`gender_preference.eq.${genderValue},gender_preference.eq.any`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (data) setListings(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchListings();
    }, [searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (propertyType !== 'all') params.set('type', propertyType);
        if (genderFilter !== 'all') params.set('gender', genderFilter);
        setSearchParams(params);
    };

    const toggleAmenity = (amenity) => {
        if (amenities.includes(amenity)) {
            setAmenities(amenities.filter(a => a !== amenity));
        } else {
            setAmenities([...amenities, amenity]);
        }
    };

    const FilterPanel = ({ className = '' }) => (
        <div className={className}>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Filters</h3>
                <button
                    onClick={() => {
                        setSearchQuery('');
                        setPropertyType('all');
                        setGenderFilter('all');
                        setPriceRange(100000);
                        setAmenities([]);
                        setSearchParams({});
                    }}
                    className="text-plum-900 text-xs font-semibold hover:text-plum-900 transition-colors"
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
                                ? 'border-plum-200 bg-plum-50 text-plum-900'
                                : 'border-transparent text-slate-400 hover:bg-[#0a080a]'
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
                                ? 'border-plum-200 bg-plum-50 text-plum-900'
                                : 'border-transparent text-slate-400 hover:bg-[#0a080a]'
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
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Max Price</label>
                    <span className="text-white font-black flex items-center text-sm" style={{ fontFamily: 'Space Grotesk' }}>
                        <IndianRupee size={14} className="mr-0.5" />
                        {priceRange.toLocaleString()}
                    </span>
                </div>
                <input
                    type="range"
                    min="2000"
                    max="100000"
                    step="500"
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-plum-900"
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
                                    ? 'bg-plum-900 border-plum-900'
                                    : 'border-white/10 group-hover:border-plum-300'
                                    }`}
                            >
                                {amenities.includes(amenity) && <Check size={12} className="text-white" />}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${amenities.includes(amenity) ? 'text-white' : 'text-slate-400'}`}>
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
        <div className="min-h-screen bg-[#0a080a] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>Explore Stays</h1>
                        <p className="text-slate-400 font-normal text-sm">
                            Discover {listings.length} verified properties for you
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex-1 md:max-w-sm group">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-plum-900 transition-colors" size={16} />
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
                                    <div key={i} className="bg-[#141114] rounded-3xl animate-pulse" style={{ height: 380, border: '1px solid rgba(0,0,0,0.04)' }}></div>
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                {listings.map((listing) => (
                                    <PropertyCard key={listing.id} property={listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="card-elevated rounded-[2rem] p-20 text-center border border-dashed border-white/10">
                                <div className="w-16 h-16 bg-[#0a080a] rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-300">
                                    <Home size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>No properties found</h3>
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
                <div className="fixed inset-0 z-[100] bg-[#141114] animate-fade-in md:hidden">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Filters</h3>
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
