import React, { useState, useEffect } from 'react';
import { databases, storage, DATABASE_ID, COLLECTION, BUCKET_ID, Query, ID, parseJsonField } from '../../lib/appwrite';
import {
    CheckCircle, Users, Home, MapPin, IndianRupee,
    Clock, Trash2, ShieldCheck, LogOut, Loader2, Plus,
    Upload, X, Image as ImageIcon, Save
} from 'lucide-react';
import { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminPanel = () => {
    const { user, profile, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState('listings');
    const [listings, setListings] = useState([]);
    const [roommates, setRoommates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [stats, setStats] = useState({ users: 0, pending: 0, approved: 0, total: 0, roommate_pending: 0 });
    const [actionLoading, setActionLoading] = useState(null);
    const fileInputRef = useRef(null);

    // Add Listing Form State
    const [formData, setFormData] = useState({
        title: '', price: '', location: '', type: 'PG',
        whatsapp: '', description: '', gender: 'any',
        amenities: []
    });
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const amenityOptions = ['WiFi', 'AC', 'Food', 'Parking', 'Laundry', 'Security'];

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleAmenity = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);

        for (const file of files) {
            try {
                const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
                const endpoint = 'https://sgp.cloud.appwrite.io/v1';
                const projectId = '69a2731e00047b3b01e9';
                const url = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${result.$id}/view?project=${projectId}`;
                setUploadedImages(prev => [...prev, url]);
            } catch (err) {
                console.error('Upload error:', err);
                alert(`Failed to upload ${file.name}: ${err.message}`);
            }
        }
        setUploading(false);
    };

    const submitListing = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await databases.createDocument(DATABASE_ID, COLLECTION.listings, ID.unique(), {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                location: formData.location,
                type: formData.type,
                whatsappNumber: formData.whatsapp,
                genderPreference: formData.gender || 'any',
                amenities: JSON.stringify(formData.amenities),
                images: JSON.stringify(uploadedImages),
                ownerId: user.$id,
                status: 'approved',
                featured: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            alert('Property listed successfully!');
            setFormData({ title: '', price: '', location: '', type: 'PG', whatsapp: '', description: '', gender: 'any', amenities: [] });
            setUploadedImages([]);
            setActiveTab('listings');
            fetchData();
        } catch (err) {
            alert('Error: ' + err.message);
        }
        setFormLoading(false);
    };

    useEffect(() => { fetchData(); }, [filter, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'listings') {
                const queries = [Query.orderDesc('$createdAt'), Query.limit(100)];
                if (filter !== 'all') queries.push(Query.equal('status', filter));
                const res = await databases.listDocuments(DATABASE_ID, COLLECTION.listings, queries);
                setListings(res.documents);
            } else {
                const queries = [Query.orderDesc('$createdAt'), Query.limit(100)];
                if (filter !== 'all') queries.push(Query.equal('status', filter));
                const res = await databases.listDocuments(DATABASE_ID, COLLECTION.roommateRequests, queries);
                setRoommates(res.documents);
            }

            // Fetch stats
            const [profilesRes, pendingRes, approvedRes, totalRes, rmPendingRes] = await Promise.all([
                databases.listDocuments(DATABASE_ID, COLLECTION.profiles, [Query.limit(1)]),
                databases.listDocuments(DATABASE_ID, COLLECTION.listings, [Query.equal('status', 'pending'), Query.limit(1)]),
                databases.listDocuments(DATABASE_ID, COLLECTION.listings, [Query.equal('status', 'approved'), Query.limit(1)]),
                databases.listDocuments(DATABASE_ID, COLLECTION.listings, [Query.limit(1)]),
                databases.listDocuments(DATABASE_ID, COLLECTION.roommateRequests, [Query.equal('status', 'pending'), Query.limit(1)]),
            ]);

            setStats({
                users: profilesRes.total || 0,
                pending: pendingRes.total || 0,
                approved: approvedRes.total || 0,
                total: totalRes.total || 0,
                roommate_pending: rmPendingRes.total || 0
            });
        } catch (err) {
            console.error('Fetch error:', err);
        }
        setLoading(false);
    };

    const approve = async (id) => {
        setActionLoading(id + '_approve');
        const col = activeTab === 'listings' ? COLLECTION.listings : COLLECTION.roommateRequests;
        try {
            await databases.updateDocument(DATABASE_ID, col, id, { status: 'approved' });
            await fetchData();
        } catch (err) {
            console.error('Approve error:', err);
        }
        setActionLoading(null);
    };

    const reject = async (id) => {
        if (!window.confirm(`Permanently DELETE this ${activeTab === 'listings' ? 'listing' : 'request'}?`)) return;
        setActionLoading(id + '_reject');
        const col = activeTab === 'listings' ? COLLECTION.listings : COLLECTION.roommateRequests;
        try {
            await databases.deleteDocument(DATABASE_ID, col, id);
            if (activeTab === 'listings') setListings(prev => prev.filter(l => l.$id !== id));
            else setRoommates(prev => prev.filter(r => r.$id !== id));
        } catch (err) {
            console.error('Reject error:', err);
        }
        setActionLoading(null);
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 20px -4px rgba(99,102,241,0.3)' }}>
                                <ShieldCheck size={20} />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>Admin Panel</h1>
                        </div>
                        <p className="text-slate-400 font-normal text-sm">
                            Logged in as <span className="font-semibold text-slate-700">{profile?.fullName || profile?.name || user?.email}</span>
                            <span className="ml-2 text-[10px] font-semibold bg-plum-100 text-plum-600 px-2 py-0.5 rounded-md">Admin</span>
                        </p>
                    </div>
                    <button
                        onClick={signOut}
                        className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
                    >
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Users', value: stats.users, icon: Users, gradient: 'from-plum-500 to-purple-600' },
                        { label: 'Listings', value: stats.total, icon: Home, gradient: 'from-plum-950 to-plum-600' },
                        { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
                        { label: 'Live', value: stats.approved, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600' },
                        { label: 'RM Pending', value: stats.roommate_pending, icon: Users, gradient: 'from-pink-500 to-rose-600' },
                    ].map((s, i) => (
                        <div key={i} className="card-elevated p-5 flex flex-col gap-2">
                            <div className={`bg-gradient-to-br ${s.gradient} w-10 h-10 rounded-xl flex items-center justify-center text-white`}
                                style={{ boxShadow: '0 4px 12px -2px rgba(0,0,0,0.15)' }}>
                                <s.icon size={18} />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 leading-none" style={{ fontFamily: 'Bungee' }}>{s.value}</p>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="card-elevated overflow-hidden">
                    {/* Tab Switcher */}
                    <div className="flex border-b border-slate-100/80">
                        <button
                            onClick={() => { setActiveTab('listings'); setFilter('pending'); }}
                            className={`flex-1 py-4 text-sm font-semibold transition-all ${activeTab === 'listings'
                                ? 'text-plum-600 border-b-2 border-plum-500 bg-plum-50/30'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Properties ({stats.total})
                        </button>
                        <button
                            onClick={() => { setActiveTab('roommates'); setFilter('pending'); }}
                            className={`flex-1 py-4 text-sm font-semibold transition-all ${activeTab === 'roommates'
                                ? 'text-plum-600 border-b-2 border-plum-500 bg-plum-50/30'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Roommate Req ({stats.roommate_pending})
                        </button>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex-1 py-4 text-sm font-semibold transition-all ${activeTab === 'add'
                                ? 'text-plum-600 border-b-2 border-plum-500 bg-plum-50/30'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            + Add Property
                        </button>
                    </div>

                    {/* Filter Bar */}
                    {activeTab !== 'add' && (
                        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>
                                {activeTab === 'listings' ? 'Listing Verification' : 'Student Requirements'}
                            </h3>
                            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100/60">
                                {[
                                    { key: 'pending', label: 'Pending' },
                                    { key: 'approved', label: 'Approved' },
                                    { key: 'all', label: 'All' },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key)}
                                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filter === key
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'add' ? (
                        <div className="p-8 max-w-4xl mx-auto">
                            <form onSubmit={submitListing} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Title</label>
                                        <input name="title" required value={formData.title} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-plum-500 outline-none" placeholder="e.g. Modern PG Near Campus" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Monthly Price</label>
                                        <input name="price" type="number" required value={formData.price} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-plum-500 outline-none" placeholder="e.g. 8500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Location</label>
                                        <input name="location" required value={formData.location} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-plum-500 outline-none" placeholder="e.g. Knowledge Park 2" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">WhatsApp Number</label>
                                        <input name="whatsapp" required value={formData.whatsapp} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-plum-500 outline-none" placeholder="+91 XXXX XXXX" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Property Type</label>
                                        <select name="type" value={formData.type} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-plum-500 outline-none">
                                            <option>PG</option>
                                            <option>Flat</option>
                                            <option>Hostel</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Gender Preference</label>
                                        <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-plum-500 outline-none">
                                            <option value="any">Any</option>
                                            <option value="boys">Boys Only</option>
                                            <option value="girls">Girls Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-plum-500 outline-none h-24" placeholder="Describe the property, rules, etc." />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Amenities</label>
                                    <div className="flex flex-wrap gap-2">
                                        {amenityOptions.map(opt => (
                                            <button
                                                key={opt} type="button"
                                                onClick={() => toggleAmenity(opt)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${formData.amenities.includes(opt)
                                                    ? 'bg-plum-600 border-plum-600 text-white'
                                                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Photos (Required)</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {uploadedImages.map((url, i) => (
                                            <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 relative group">
                                                <img src={url} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            disabled={uploading}
                                            className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-plum-300 hover:text-plum-500 transition-all bg-slate-50/50"
                                        >
                                            {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                                            <span className="text-[10px] font-bold mt-2 uppercase tracking-wider">{uploading ? 'Uploading...' : 'Add Photos'}</span>
                                        </button>
                                    </div>
                                    <input type="file" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                </div>

                                <button
                                    type="submit"
                                    disabled={formLoading || uploadedImages.length === 0}
                                    className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-sm"
                                >
                                    {formLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    {formLoading ? 'Publishing...' : 'Publish Verified Stay'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                            {activeTab === 'listings' ? 'Property' : 'Student'}
                                        </th>
                                        <th className="px-6 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                            {activeTab === 'listings' ? 'Type / Rent' : 'College / Budget'}
                                        </th>
                                        <th className="px-6 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        Array(4).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={7} className="px-6 py-5">
                                                    <div className="h-8 bg-slate-50 rounded-xl w-full" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (activeTab === 'listings' ? listings : roommates).length > 0 ? (activeTab === 'listings' ? listings : roommates).map((item) => (
                                        <tr key={item.$id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{item.$id.slice(-6)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {activeTab === 'listings' ? (
                                                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100/60">
                                                            <img
                                                                src={parseJsonField(item.images)?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'}
                                                                className="w-full h-full object-cover"
                                                                alt=""
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-br from-plum-400 to-plum-500 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-semibold">
                                                            {(item.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-slate-900 truncate max-w-[180px]" style={{ fontFamily: 'Bungee' }}>
                                                            {activeTab === 'listings' ? item.title : (item.name || 'Student')}
                                                        </h4>
                                                        <span className="text-[10px] font-medium text-slate-400 block italic">
                                                            {activeTab === 'listings' ? `Owner: ${item.owner?.full_name || 'User'}` : `ID: ${item.$id.slice(0, 8)}...`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">
                                                        WA: {item.whatsappNumber || item.whatsapp || '-'}
                                                    </span>
                                                    {(item.phoneNumber || item.phone) && (
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full w-fit">
                                                            PH: {item.phoneNumber || item.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-md text-slate-500 block mb-1 w-fit border border-slate-100/60">
                                                    {activeTab === 'listings' ? item.type : (item.college || 'N/A')}
                                                </span>
                                                <span className="text-sm font-bold text-slate-900 flex items-center" style={{ fontFamily: 'Bungee' }}>
                                                    <IndianRupee size={12} className="mr-0.5" />{Number(item.budget || item.price || 0).toLocaleString()}/mo
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-slate-500 font-normal max-w-[150px] gap-1.5">
                                                    <MapPin size={12} className="text-plum-400 shrink-0" />
                                                    <span className="truncate text-xs">{item.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={item.status === 'approved' ? 'chip-approved' : 'chip-pending'}>
                                                    {item.status === 'approved' ? 'Live' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {item.status !== 'approved' && (
                                                        <button
                                                            onClick={() => approve(item.$id)}
                                                            disabled={actionLoading === item.$id + '_approve'}
                                                            className="w-8 h-8 bg-gradient-to-br from-plum-500 to-plum-600 hover:from-plum-600 hover:to-plum-700 text-white rounded-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
                                                            style={{ boxShadow: '0 2px 8px -2px rgba(99,102,241,0.4)' }}
                                                        >
                                                            {actionLoading === item.$id + '_approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => reject(item.$id)}
                                                        disabled={actionLoading === item.$id + '_reject'}
                                                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 border border-red-100/60"
                                                    >
                                                        {actionLoading === item.$id + '_reject' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                    {activeTab === 'listings' ? <Home size={24} /> : <Users size={24} />}
                                                </div>
                                                <p className="text-slate-400 font-medium">No {filter} items found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
