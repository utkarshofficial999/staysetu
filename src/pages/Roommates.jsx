import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION, Query, ID } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import {
    Users, Search, MessageCircle, MapPin, IndianRupee, Calendar,
    User, GraduationCap, CheckCircle2, ArrowRight, X, Phone, Plus
} from 'lucide-react';

const Roommates = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGender, setFilterGender] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        location: '', budget: '', gender_preference: 'any',
        move_in_date: '', description: '', whatsapp: '', college: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION.roommateRequests,
                [
                    Query.equal('status', 'approved'),
                    Query.orderDesc('$createdAt'),
                ]
            );
            setRequests(res.documents);
        } catch (err) {
            console.error('Fetch error:', err);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);

        try {
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION.roommateRequests,
                ID.unique(),
                {
                    userId: user.$id,
                    name: user.name || user.email,
                    location: form.location,
                    budget: parseFloat(form.budget) || null,
                    genderPreference: form.gender_preference,
                    moveInDate: form.move_in_date || null,
                    description: form.description,
                    whatsapp: form.whatsapp,
                    college: form.college,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                }
            );

            setSuccess(true);
            setForm({ location: '', budget: '', gender_preference: 'any', move_in_date: '', description: '', whatsapp: '', college: '' });
            setTimeout(() => { setSuccess(false); setShowForm(false); }, 2500);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = requests.filter(r => {
        const matchSearch = !searchQuery ||
            r.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchGender = filterGender === 'all' || r.genderPreference === filterGender;

        return matchSearch && matchGender;
    });

    return (
        <div className="min-h-screen bg-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="section-label mb-4 block w-fit">Community</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>
                            Find Roommates
                        </h1>
                        <p className="text-slate-400 font-normal mt-2 max-w-md text-sm">
                            Connect with verified students looking for roommates near your college.
                        </p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="btn-primary flex items-center gap-2 text-sm"
                        >
                            <Plus size={16} />
                            Post Requirement
                        </button>
                    )}
                </div>

                {/* Form */}
                {showForm && (
                    <div className="card-elevated p-8 mb-10 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>Post Your Requirement</h2>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 animate-fade-in">
                                <CheckCircle2 className="text-emerald-500" size={18} />
                                <p className="text-emerald-700 font-medium text-sm">Submitted! Your post is pending admin verification.</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Preferred Location</label>
                                <input type="text" required className="input-field text-sm" placeholder="e.g. Alpha 1, Greater Noida" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Budget (₹/month)</label>
                                <input type="number" required className="input-field text-sm" placeholder="5000" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">College/University</label>
                                <input type="text" required className="input-field text-sm" placeholder="Your college name" value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">WhatsApp Number</label>
                                <input type="tel" required className="input-field text-sm" placeholder="91XXXXXXXXXX" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Gender Preference</label>
                                <select className="input-field text-sm cursor-pointer" value={form.gender_preference} onChange={e => setForm({ ...form, gender_preference: e.target.value })}>
                                    <option value="any">Any</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Move-in Date</label>
                                <input type="date" className="input-field text-sm cursor-pointer" value={form.move_in_date} onChange={e => setForm({ ...form, move_in_date: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
                                <textarea rows={3} required className="input-field text-sm resize-none" placeholder="Tell a bit about yourself and what you're looking for..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-sm">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ArrowRight size={15} /> Submit</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-plum-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search by location, college..."
                            className="input-field pl-10 text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'male', 'female'].map(g => (
                            <button
                                key={g}
                                onClick={() => setFilterGender(g)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filterGender === g
                                    ? 'bg-plum-50 text-plum-600 border-plum-200'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-plum-200 hover:text-plum-600'
                                    }`}
                            >
                                {g === 'all' ? 'All' : g === 'male' ? 'Male' : 'Female'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-slate-50 rounded-3xl animate-pulse" style={{ height: 260, border: '1px solid rgba(0,0,0,0.04)' }} />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(req => (
                            <div key={req.$id} className="card-elevated p-6 flex flex-col">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-plum-400 to-plum-500 flex items-center justify-center text-white font-semibold text-sm">
                                            {(req.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'Bungee' }}>{req.name}</h3>
                                            {req.college && (
                                                <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                                                    <GraduationCap size={10} /> {req.college}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="chip-approved flex items-center gap-1">
                                        <CheckCircle2 size={9} /> Verified
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{req.description}</p>

                                {/* Info pills */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {req.location && (
                                        <span className="flex items-center gap-1.5 text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg">
                                            <MapPin size={10} className="text-plum-400" /> {req.location}
                                        </span>
                                    )}
                                    {req.budget && (
                                        <span className="flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg">
                                            <IndianRupee size={10} className="text-plum-400" /> {req.budget?.toLocaleString()}/mo
                                        </span>
                                    )}
                                    {(req.genderPreference || req.gender_preference) !== 'any' && (
                                        <span className="flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg">
                                            <User size={10} className="text-plum-400" /> {req.genderPreference || req.gender_preference}
                                        </span>
                                    )}
                                    {(req.moveInDate || req.move_in_date) && (
                                        <span className="flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg">
                                            <Calendar size={10} className="text-plum-400" /> {new Date(req.moveInDate || req.move_in_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>

                                {/* CTA */}
                                {req.whatsapp && (
                                    <a
                                        href={`https://wa.me/${req.whatsapp.replace(/\D/g, '')}?text=Hi ${req.name}, I found your roommate requirement on StaySetu.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-whatsapp text-sm justify-center mt-auto"
                                    >
                                        <MessageCircle size={15} /> Connect on WhatsApp
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card-elevated rounded-[2rem] p-16 text-center border border-dashed border-white/10">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-400">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Bungee' }}>No roommate requests yet</h3>
                        <p className="text-slate-400 font-normal mb-6 text-sm">Be the first to post your requirement!</p>
                        {user && (
                            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                                Post Requirement
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Roommates;
