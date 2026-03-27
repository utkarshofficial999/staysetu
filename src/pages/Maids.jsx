import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION, Query } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import { trackWhatsAppClick, openWhatsApp } from '../lib/whatsappTracker';
import {
    MapPin, IndianRupee, Phone, Clock, CheckCircle2,
    Search, Filter, MessageCircle, Sparkles, UserCheck,
    Loader2, Brush
} from 'lucide-react';

const serviceTypeLabels = {
    'cooking': '🍳 Cooking',
    'cleaning': '🧹 Cleaning',
    'laundry': '👕 Laundry',
    'all-in-one': '⭐ All-in-One',
    'babysitting': '👶 Babysitting',
    'elderly-care': '🧓 Elderly Care',
};

const Maids = () => {
    const { user, profile } = useAuth();
    const [maids, setMaids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchMaids();
    }, []);

    const fetchMaids = async () => {
        setLoading(true);
        try {
            const queries = [
                Query.equal('status', 'approved'),
                Query.orderDesc('$createdAt'),
                Query.limit(100),
            ];
            const res = await databases.listDocuments(DATABASE_ID, COLLECTION.maidServices, queries);
            setMaids(res.documents);
        } catch (err) {
            console.error('Error fetching maids:', err);
        }
        setLoading(false);
    };

    const filteredMaids = maids.filter(m => {
        const matchesSearch = !searchTerm ||
            m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || m.serviceType === filterType;
        return matchesSearch && matchesType;
    });

    const handleContactClick = (maid) => {
        const messageText = `Hi, I found your maid service "${maid.title}" on StaySetu. I'm interested!`;
        const message = encodeURIComponent(messageText);

        trackWhatsAppClick({
            phoneNumber: maid.whatsappNumber || maid.phoneNumber,
            listingId: maid.$id,
            listingTitle: maid.title,
            ownerName: maid.posterName || '',
            clickerUserId: user?.$id || '',
            clickerName: profile?.fullName || user?.name || '',
            clickerEmail: user?.email || '',
            source: 'maid_services',
            message: messageText,
        });

        openWhatsApp(maid.whatsappNumber || maid.phoneNumber, message);
    };

    return (
        <div className="min-h-screen bg-surface pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-4">
                        <Sparkles size={12} /> Maid Services
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Bungee' }}>
                        Find Trusted Maids
                    </h1>
                    <p className="text-slate-400 text-sm font-normal max-w-xl mx-auto">
                        Browse verified maid services in your area — cooking, cleaning, laundry, and more. Contact directly via WhatsApp.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or location..."
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'cooking', label: '🍳 Cooking' },
                            { key: 'cleaning', label: '🧹 Cleaning' },
                            { key: 'laundry', label: '👕 Laundry' },
                            { key: 'all-in-one', label: '⭐ All' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilterType(f.key)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-all ${filterType === f.key
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 size={32} className="animate-spin text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">Loading maid services...</p>
                    </div>
                ) : filteredMaids.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMaids.map((maid) => (
                            <div key={maid.$id} className="group bg-white rounded-3xl border-2 border-slate-900 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
                                {/* Top Banner */}
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-xl">
                                            {serviceTypeLabels[maid.serviceType]?.charAt(0) || '🧹'}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest block">
                                                {serviceTypeLabels[maid.serviceType] || maid.serviceType || 'Maid Service'}
                                            </span>
                                            <h3 className="text-lg font-bold text-white truncate max-w-[200px]" style={{ fontFamily: 'Bungee' }}>
                                                {maid.title}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-4">
                                    {maid.description && (
                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{maid.description}</p>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin size={14} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{maid.location}</span>
                                        </div>
                                        {maid.timing && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock size={14} className="text-slate-400 shrink-0" />
                                                <span>{maid.timing}</span>
                                            </div>
                                        )}
                                        {maid.price && (
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                <IndianRupee size={14} className="text-slate-400 shrink-0" />
                                                <span style={{ fontFamily: 'Bungee' }}>₹{Number(maid.price).toLocaleString()}/mo</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-xs font-bold">
                                                {(maid.posterName || 'O').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-700">{maid.posterName || 'Owner'}</p>
                                                <p className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                                                    <CheckCircle2 size={8} /> Verified
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleContactClick(maid)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                        >
                                            <MessageCircle size={13} /> WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300 border border-slate-200">
                            <Brush size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'Bungee' }}>No maid services found</h3>
                        <p className="text-slate-400 text-sm">Check back soon — new services are added regularly.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Maids;
