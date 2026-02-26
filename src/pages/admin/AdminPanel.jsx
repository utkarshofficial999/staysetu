import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    CheckCircle, Users, Home, MapPin, IndianRupee,
    Clock, Trash2, ShieldCheck, LogOut, Loader2
} from 'lucide-react';
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

    useEffect(() => { fetchData(); }, [filter, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        if (activeTab === 'listings') {
            let query = supabase.from('listings').select('*, owner:owner_id(full_name, id)');
            if (filter !== 'all') query = query.eq('status', filter);
            const { data } = await query.order('created_at', { ascending: false });
            if (data) setListings(data);
        } else {
            let query = supabase.from('roommate_requests').select('*');
            if (filter !== 'all') query = query.eq('status', filter);
            const { data } = await query.order('created_at', { ascending: false });
            if (data) setRoommates(data);
        }

        const [
            { count: usersCount },
            { count: pendingCount },
            { count: approvedCount },
            { count: totalCount },
            { count: rmPendingCount }
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
            supabase.from('listings').select('*', { count: 'exact', head: true }),
            supabase.from('roommate_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        setStats({
            users: usersCount || 0,
            pending: pendingCount || 0,
            approved: approvedCount || 0,
            total: totalCount || 0,
            roommate_pending: rmPendingCount || 0
        });
        setLoading(false);
    };

    const approve = async (id) => {
        setActionLoading(id + '_approve');
        const table = activeTab === 'listings' ? 'listings' : 'roommate_requests';
        const { error } = await supabase.from(table).update({ status: 'approved' }).eq('id', id);
        if (!error) await fetchData();
        setActionLoading(null);
    };

    const reject = async (id) => {
        if (!window.confirm(`Permanently DELETE this ${activeTab === 'listings' ? 'listing' : 'request'}?`)) return;
        setActionLoading(id + '_reject');
        const table = activeTab === 'listings' ? 'listings' : 'roommate_requests';
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) {
            if (activeTab === 'listings') setListings(prev => prev.filter(l => l.id !== id));
            else setRoommates(prev => prev.filter(r => r.id !== id));
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
                            Logged in as <span className="font-semibold text-slate-700">{profile?.full_name || profile?.name || user?.email}</span>
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
                    </div>

                    {/* Filter Bar */}
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

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        {activeTab === 'listings' ? 'Property' : 'Student'}
                                    </th>
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
                                            <td colSpan={5} className="px-6 py-5">
                                                <div className="h-8 bg-slate-50 rounded-xl w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (activeTab === 'listings' ? listings : roommates).length > 0 ? (activeTab === 'listings' ? listings : roommates).map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {activeTab === 'listings' ? (
                                                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100/60">
                                                        <img
                                                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-br from-plum-400 to-plum-500 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-semibold">
                                                        {(item.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-slate-900 truncate max-w-[200px]" style={{ fontFamily: 'Bungee' }}>
                                                        {activeTab === 'listings' ? item.title : (item.name || 'Student')}
                                                    </h4>
                                                    <span className="text-[10px] font-medium text-slate-400 block">
                                                        {activeTab === 'listings' ? `Owner: ${item.owner?.full_name || 'User'}` : `WA: ${item.whatsapp || '-'}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-md text-slate-500 block mb-1 w-fit border border-slate-100/60">
                                                {activeTab === 'listings' ? item.type : (item.college || 'N/A')}
                                            </span>
                                            <span className="text-sm font-bold text-slate-900 flex items-center" style={{ fontFamily: 'Bungee' }}>
                                                <IndianRupee size={12} className="mr-0.5" />{item.budget || item.price?.toLocaleString()}/mo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-slate-500 font-normal max-w-[180px] gap-1.5">
                                                <MapPin size={12} className="text-plum-400 shrink-0" />
                                                <span className="truncate text-sm">{item.location}</span>
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
                                                        onClick={() => approve(item.id)}
                                                        disabled={actionLoading === item.id + '_approve'}
                                                        className="w-8 h-8 bg-gradient-to-br from-plum-500 to-plum-600 hover:from-plum-600 hover:to-plum-700 text-white rounded-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
                                                        style={{ boxShadow: '0 2px 8px -2px rgba(99,102,241,0.4)' }}
                                                    >
                                                        {actionLoading === item.id + '_approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => reject(item.id)}
                                                    disabled={actionLoading === item.id + '_reject'}
                                                    className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 border border-red-100/60"
                                                >
                                                    {actionLoading === item.id + '_reject' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
