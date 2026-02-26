import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../../components/common/PropertyCard';
import {
    Search, Heart, User, Home, MapPin,
    Star, BookmarkCheck, Bell, TrendingUp, Eye, Clock,
    ChevronRight, Filter, IndianRupee, Sparkles, Shield,
    LogOut, Settings, X, Users, Phone, Plus, Loader2,
    CheckCircle, Calendar, UserCheck
} from 'lucide-react';

const StudentDashboard = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('browse');
    const [listings, setListings] = useState([]);
    const [savedListings, setSavedListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [propertyType, setPropertyType] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [priceRange, setPriceRange] = useState(100000);
    const [stats, setStats] = useState({ saved: 0, viewed: 0 });

    // Roommate state
    const [roommateRequests, setRoommateRequests] = useState([]);
    const [roommateLoading, setRoommateLoading] = useState(false);
    const [showRoommateForm, setShowRoommateForm] = useState(false);
    const [roommateSubmitting, setRoommateSubmitting] = useState(false);
    const [roommateSuccess, setRoommateSuccess] = useState(false);
    const [roommateForm, setRoommateForm] = useState({
        location: '',
        budget: '',
        gender_preference: 'any',
        move_in_date: '',
        description: '',
        whatsapp: '',
        college: '',
    });

    useEffect(() => {
        if (user) {
            fetchAllData();
            fetchRoommateRequests();
        }
    }, [user]);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
            fetchListings(),
            fetchSavedListings(),
        ]);
        setLoading(false);
    };

    const fetchListings = async () => {
        let query = supabase
            .from('listings')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        const { data } = await query;
        if (data) setListings(data);
    };

    const fetchSavedListings = async () => {
        if (!user) return;
        const { data: favData } = await supabase
            .from('favorites')
            .select('listing_id')
            .eq('user_id', user.id);

        if (favData && favData.length > 0) {
            const listingIds = favData.map(f => f.listing_id);
            const { data: listingsData } = await supabase
                .from('listings')
                .select('*')
                .in('id', listingIds);

            if (listingsData) {
                setSavedListings(listingsData);
                setStats(prev => ({ ...prev, saved: listingsData.length }));
            }
        }
    };


    // ── Roommate functions ───────────────────────────────────────────────────
    const fetchRoommateRequests = async () => {
        setRoommateLoading(true);
        const { data, error } = await supabase
            .from('roommate_requests')
            .select('*, student:user_id(full_name)')
            .or(`status.eq.approved,user_id.eq.${user.id}`)
            .order('created_at', { ascending: false });
        if (data) setRoommateRequests(data);
        setRoommateLoading(false);
    };

    const handleRoommateSubmit = async (e) => {
        e.preventDefault();
        setRoommateSubmitting(true);
        try {
            const { error } = await supabase.from('roommate_requests').insert([{
                user_id: user.id,
                name: profile?.name || user.email,
                location: roommateForm.location,
                budget: parseFloat(roommateForm.budget) || null,
                gender_preference: roommateForm.gender_preference,
                move_in_date: roommateForm.move_in_date || null,
                description: roommateForm.description,
                whatsapp: roommateForm.whatsapp,
                college: roommateForm.college,
                status: 'pending'
            }]);
            if (error) throw error;
            setRoommateSuccess(true);
            setRoommateForm({ location: '', budget: '', gender_preference: 'any', move_in_date: '', description: '', whatsapp: '', college: '' });
            await fetchRoommateRequests();
            setTimeout(() => { setRoommateSuccess(false); setShowRoommateForm(false); }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setRoommateSubmitting(false);
        }
    };

    const toggleSave = async (listingId) => {
        if (!user) return navigate('/login');

        const isSaved = savedListings.some(l => l.id === listingId);
        if (isSaved) {
            await supabase.from('favorites').delete()
                .eq('user_id', user.id)
                .eq('listing_id', listingId);
            setSavedListings(prev => prev.filter(l => l.id !== listingId));
            setStats(prev => ({ ...prev, saved: prev.saved - 1 }));
        } else {
            await supabase.from('favorites').insert([{ user_id: user.id, listing_id: listingId }]);
            const listing = listings.find(l => l.id === listingId);
            if (listing) {
                setSavedListings(prev => [...prev, listing]);
                setStats(prev => ({ ...prev, saved: prev.saved + 1 }));
            }
        }
    };

    const filteredListings = listings.filter(listing => {
        const matchesSearch = !searchQuery ||
            listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.location?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = propertyType === 'all' || listing.type === propertyType;
        const matchesPrice = listing.price <= priceRange;
        let matchesGender = true;
        if (genderFilter !== 'all') {
            const genderValue = genderFilter === 'male' ? 'boys' : 'girls';
            matchesGender = listing.gender_preference === genderValue || listing.gender_preference === 'any';
        }
        return matchesSearch && matchesType && matchesPrice && matchesGender;
    });

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const tabs = [
        { id: 'browse', label: 'Browse Stays', icon: Search, count: listings.length },
        { id: 'roommate', label: 'Find Roommate', icon: Users },
        { id: 'saved', label: 'Saved', icon: Heart, count: stats.saved },
        { id: 'profile', label: 'My Profile', icon: User },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-plum-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Welcome Header */}
                <div className="mb-8 pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-plum-500 to-plum-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-plum-200">
                                    {profile?.name?.charAt(0)?.toUpperCase() || 'S'}
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                                        Hey, {profile?.name?.split(' ')[0] || 'Student'} 👋
                                    </h1>
                                    <p className="text-slate-400 font-medium text-sm">Find your perfect home away from home.</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-3">
                            {[
                                { label: 'Saved', value: stats.saved, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                                { label: 'Available', value: listings.length, icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                                    <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                                        <stat.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-900">{stat.value}</p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-slate-100 rounded-2xl p-1.5 border border-slate-200 shadow-sm mb-8 flex gap-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-plum-500 text-white shadow-lg shadow-plum-200'
                                : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Browse Tab */}
                {activeTab === 'browse' && (
                    <div className="animate-fade-in">
                        {/* Search & Filter Bar */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by location, property name, or college..."
                                        className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-plum-500/20 focus:border-plum-400 transition-all font-medium text-sm text-slate-900"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    {['all', 'PG', 'Flat', 'Hostel'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setPropertyType(type)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${propertyType === type
                                                ? 'bg-plum-500 text-white shadow-md shadow-plum-200'
                                                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                                                }`}
                                        >
                                            {type === 'all' ? 'All' : type}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    {[{ key: 'all', label: 'All' }, { key: 'male', label: 'Boys' }, { key: 'female', label: 'Girls' }].map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => setGenderFilter(key)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${genderFilter === key
                                                ? 'bg-plum-500 text-white shadow-md shadow-plum-200'
                                                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Max Budget</span>
                                <input
                                    type="range"
                                    min="2000"
                                    max="100000"
                                    step="500"
                                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-plum-500"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                />
                                <span className="text-plum-600 font-black flex items-center text-sm min-w-[80px] justify-end">
                                    <IndianRupee size={14} />
                                    {priceRange.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-slate-400 font-medium">
                                <span className="text-slate-900 font-black">{filteredListings.length}</span> properties found
                            </p>
                        </div>

                        {filteredListings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredListings.map((listing) => (
                                    <div key={listing.id} className="relative">
                                        <PropertyCard property={listing} />
                                        <button
                                            onClick={() => toggleSave(listing.id)}
                                            className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${savedListings.some(l => l.id === listing.id)
                                                ? 'bg-rose-500 text-white'
                                                : 'bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 border border-slate-100'
                                                }`}
                                        >
                                            <Heart size={18} fill={savedListings.some(l => l.id === listing.id) ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-[2.5rem] p-20 text-center border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 border border-slate-100">
                                    <Home size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No properties found</h3>
                                <p className="text-slate-400 font-medium mb-6">Try adjusting your filters or search.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setPropertyType('all'); setPriceRange(100000); }}
                                    className="btn-secondary"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ══ ROOMMATE TAB ══════════════════════════════════════════ */}
                {activeTab === 'roommate' && (
                    <div className="animate-fade-in">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Find a Roommate</h2>
                                <p className="text-slate-400 font-medium text-sm">Post your requirement and connect with compatible students.</p>
                            </div>
                            <button
                                onClick={() => setShowRoommateForm(f => !f)}
                                className="btn-primary py-3 px-6 flex items-center gap-2 shrink-0"
                            >
                                {showRoommateForm ? <X size={18} /> : <Plus size={18} />}
                                {showRoommateForm ? 'Cancel' : 'Post My Requirement'}
                            </button>
                        </div>

                        {/* Post Form */}
                        {showRoommateForm && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <UserCheck size={20} className="text-plum-500" />
                                    Tell others what you're looking for
                                </h3>
                                {roommateSuccess ? (
                                    <div className="flex flex-col items-center py-10 text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4">
                                            <CheckCircle size={32} />
                                        </div>
                                        <p className="font-bold text-slate-900 text-lg">Submitted for Review!</p>
                                        <p className="text-slate-400 text-sm mt-1">Your requirement is pending admin verification. It will go live once approved.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRoommateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Preferred Location *</label>
                                            <div className="relative">
                                                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input required type="text" placeholder="e.g. Knowledge Park, Noida"
                                                    className="input-field pl-9 text-sm"
                                                    value={roommateForm.location}
                                                    onChange={e => setRoommateForm(p => ({ ...p, location: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">College / University</label>
                                            <input type="text" placeholder="e.g. GL Bajaj, NIET..."
                                                className="input-field text-sm"
                                                value={roommateForm.college}
                                                onChange={e => setRoommateForm(p => ({ ...p, college: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Monthly Budget (₹)</label>
                                            <div className="relative">
                                                <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="number" placeholder="e.g. 6000"
                                                    className="input-field pl-9 text-sm"
                                                    value={roommateForm.budget}
                                                    onChange={e => setRoommateForm(p => ({ ...p, budget: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Move-in Date</label>
                                            <div className="relative">
                                                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="date"
                                                    className="input-field pl-9 text-sm"
                                                    value={roommateForm.move_in_date}
                                                    onChange={e => setRoommateForm(p => ({ ...p, move_in_date: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Roommate Preference</label>
                                            <select className="input-field text-sm"
                                                value={roommateForm.gender_preference}
                                                onChange={e => setRoommateForm(p => ({ ...p, gender_preference: e.target.value }))}>
                                                <option value="any">Any Gender</option>
                                                <option value="male">Male Only</option>
                                                <option value="female">Female Only</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp Number *</label>
                                            <div className="relative">
                                                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input required type="tel" placeholder="+91 XXXXX XXXXX"
                                                    className="input-field pl-9 text-sm"
                                                    value={roommateForm.whatsapp}
                                                    onChange={e => setRoommateForm(p => ({ ...p, whatsapp: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">About You & What You Need</label>
                                            <textarea rows={3} placeholder="I am a 2nd year B.Tech student looking for a clean, quiet roommate. Prefer non-smoker..."
                                                className="input-field text-sm resize-none"
                                                value={roommateForm.description}
                                                onChange={e => setRoommateForm(p => ({ ...p, description: e.target.value }))} />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end">
                                            <button type="submit" disabled={roommateSubmitting}
                                                className="btn-primary py-3 px-8 flex items-center gap-2">
                                                {roommateSubmitting
                                                    ? <><Loader2 size={16} className="animate-spin" /> Posting...</>
                                                    : <><Plus size={16} /> Post Requirement</>
                                                }
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Requests List */}
                        {roommateLoading ? (
                            <div className="flex items-center justify-center py-20 text-slate-400">
                                <Loader2 size={28} className="animate-spin mr-3" /> Loading posts...
                            </div>
                        ) : roommateRequests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {roommateRequests.map((req) => (
                                    <div key={req.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                        {/* Card Header */}
                                        <div className="bg-slate-50 p-5 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-plum-400 to-plum-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md">
                                                    {(req.name || req.student?.full_name || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{req.name || req.student?.full_name || 'Student'}</h4>
                                                    {req.college && (
                                                        <p className="text-xs text-slate-400 font-medium">{req.college}</p>
                                                    )}
                                                </div>
                                                <span className={`ml-auto text-[9px] font-black px-2 py-1 rounded-full uppercase ${req.gender_preference === 'female' ? 'bg-pink-100 text-pink-600'
                                                    : req.gender_preference === 'male' ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {req.gender_preference === 'any' ? 'Any Gender' : req.gender_preference + ' only'}
                                                </span>
                                            </div>
                                            {req.status === 'pending' && req.user_id === user.id && (
                                                <div className="mt-3 flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Admin Verification</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                <MapPin size={14} className="text-plum-400 shrink-0" />
                                                <span className="truncate">{req.location}</span>
                                            </div>
                                            {req.budget && (
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                    <IndianRupee size={14} className="text-emerald-500 shrink-0" />
                                                    <span>Budget: <span className="font-bold text-slate-900">₹{Number(req.budget).toLocaleString()}/mo</span></span>
                                                </div>
                                            )}
                                            {req.move_in_date && (
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                    <Calendar size={14} className="text-amber-500 shrink-0" />
                                                    <span>Move-in: <span className="font-bold text-slate-900">{new Date(req.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></span>
                                                </div>
                                            )}
                                            {req.description && (
                                                <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2 pt-1">
                                                    {req.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Connect Button */}
                                        {req.whatsapp && req.user_id !== user.id && (
                                            <div className="px-5 pb-5">
                                                <a
                                                    href={`https://wa.me/${req.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I saw your roommate requirement on StaySetu. I'm also looking in ${req.location}. Let's connect!`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-2xl transition-all active:scale-95 text-sm shadow-md shadow-green-100"
                                                >
                                                    <Phone size={16} />
                                                    Connect on WhatsApp
                                                </a>
                                            </div>
                                        )}
                                        {req.user_id === user.id && (
                                            <div className="px-5 pb-5">
                                                <span className="w-full flex items-center justify-center gap-2 bg-plum-50 text-plum-600 font-bold py-3 rounded-2xl text-sm">
                                                    <CheckCircle size={16} /> Your Post
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-[2.5rem] p-20 text-center border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-plum-300 border border-slate-100">
                                    <Users size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No roommate posts yet</h3>
                                <p className="text-slate-400 font-medium mb-6">Be the first to post your requirement!</p>
                                <button onClick={() => setShowRoommateForm(true)} className="btn-primary">
                                    Post My Requirement
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Saved Properties</h2>
                                <p className="text-slate-400 font-medium text-sm">Your bookmarked stays for easy access.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl">
                                <Heart size={16} fill="currentColor" />
                                <span className="font-bold text-sm">{savedListings.length} saved</span>
                            </div>
                        </div>

                        {savedListings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedListings.map((listing) => (
                                    <div key={listing.id} className="relative">
                                        <PropertyCard property={listing} />
                                        <button
                                            onClick={() => toggleSave(listing.id)}
                                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center transition-all shadow-sm hover:bg-rose-600"
                                        >
                                            <Heart size={18} fill="currentColor" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-[2.5rem] p-20 text-center border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-rose-300 border border-slate-100">
                                    <Heart size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No saved stays yet</h3>
                                <p className="text-slate-400 font-medium mb-6">Browse listings and tap the heart to save them here.</p>
                                <button onClick={() => setActiveTab('browse')} className="btn-primary">
                                    Browse Stays
                                </button>
                            </div>
                        )}
                    </div>
                )}


                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="animate-fade-in max-w-2xl">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">My Profile</h2>

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-plum-500 to-plum-600 p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                                <div className="relative flex items-center gap-5">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-black border-2 border-white/30">
                                        {profile?.name?.charAt(0)?.toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white">{profile?.name || 'Student'}</h3>
                                        <p className="text-white/70 font-medium">{user?.email}</p>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-white mt-2">
                                            <Shield size={10} />
                                            Student Account
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved Stays</span>
                                        <p className="text-2xl font-black text-slate-900 mt-1">{stats.saved}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversations</span>
                                        <p className="text-2xl font-black text-slate-900 mt-1">{stats.messages}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</span>
                                                <p className="text-slate-900 font-bold">{profile?.name || 'Not set'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</span>
                                                <p className="text-slate-900 font-bold">{user?.email || 'Not set'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member Since</span>
                                                <p className="text-slate-900 font-bold">
                                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { signOut(); navigate('/'); }}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-4 px-6 rounded-2xl hover:bg-red-100 transition-all"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
