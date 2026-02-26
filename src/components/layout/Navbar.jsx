import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Search, Users, ShieldCheck, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setProfile(null);
        });

        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const fetchProfile = async (userId) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) setProfile(data);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
        setDropdownOpen(false);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Browse', path: '/listings', icon: Search },
        { name: 'Roommates', path: '/roommates', icon: Users },
    ];

    const role = profile?.role || 'student';
    const dashPath = role === 'owner' ? '/owner-dashboard' : '/dashboard';

    const roleBadge = {
        admin: { bg: 'bg-rose-50', text: 'text-rose-600', label: 'Admin' },
        owner: { bg: 'bg-plum-100', text: 'text-plum-700', label: 'Owner' },
        student: { bg: 'bg-plum-50', text: 'text-plum-900', label: 'Student' },
    }[role] || { bg: 'bg-plum-50', text: 'text-plum-900', label: 'Student' };

    return (
        <>
            <nav
                className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out px-4 py-2 ${scrolled
                    ? 'top-4 w-[95%] max-w-7xl bg-white/90 rounded-[2rem] border border-slate-200/60 shadow-[0_12px_40px_rgba(58,31,61,0.08)]'
                    : 'top-0 w-full bg-white/60 backdrop-blur-xl border-b border-slate-100'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-2">
                    <div className="flex justify-between h-14 items-center">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
                            <div className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-500 rotate-0 group-hover:rotate-[360deg] shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                                style={{ background: '#ffffff' }}>
                                <span className="text-black font-black text-xl" style={{ fontFamily: 'Bungee, cursive' }}>S</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-black"
                                style={{
                                    fontFamily: 'Bungee, cursive'
                                }}>
                                StaySetu
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-2 bg-slate-100/60 p-1.5 rounded-full border border-slate-200">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative px-6 py-2 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${isActive(link.path)
                                        ? 'bg-[#ffffff] text-black shadow-[0_0_15px_rgba(255,255,255,0.6)]'
                                        : 'text-black hover:text-black/80'
                                        }`}
                                    style={{
                                        textShadow: 'none'
                                    }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Auth */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-3 bg-slate-100/60 hover:bg-slate-200/60 border border-slate-200/60 pl-2 pr-4 py-1.5 rounded-full transition-all duration-300 group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#ffffff] flex items-center justify-center text-black text-xs font-black shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                                            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[13px] font-black text-black uppercase tracking-wider"
                                            style={{ textShadow: 'none' }}>
                                            {profile?.full_name?.split(' ')[0] || 'User'}
                                        </span>
                                        <ChevronDown size={14} className={`text-black transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                                            style={{ filter: 'none' }} />
                                    </button>

                                    {/* Dropdown */}
                                    {dropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-[2rem] shadow-[0_12px_50px_rgba(0,0,0,0.15)] z-50 py-3 animate-fade-in origin-top-right overflow-hidden">
                                                {/* User info */}
                                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                                    <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tighter">{profile?.full_name || user.email}</p>
                                                    <p className="text-[10px] text-slate-500 truncate mt-0.5 font-bold uppercase">{user.email}</p>
                                                    <span className="inline-flex mt-2 px-2 py-0.5 rounded bg-[#ffffff] text-black text-[9px] font-black uppercase tracking-widest">
                                                        {roleBadge.label}
                                                    </span>
                                                </div>
                                                <div className="px-2 py-2">
                                                    <Link
                                                        to={dashPath}
                                                        className="flex items-center gap-3 px-4 py-3 text-[12px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-plum-900 rounded-2xl transition-all"
                                                        onClick={() => setDropdownOpen(false)}
                                                    >
                                                        <LayoutDashboard size={14} /> Dashboard
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all mt-1"
                                                    >
                                                        <LogOut size={14} /> Log out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className="text-[13px] font-black text-slate-900 uppercase tracking-widest px-4 py-2 hover:bg-slate-100 rounded-full transition-all">
                                        Log in
                                    </Link>
                                    <Link to="/signup" className="bg-slate-900 text-white px-7 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden w-11 h-11 flex items-center justify-center rounded-full text-slate-900 transition-all bg-slate-100/80 border border-slate-200"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {isOpen && (
                    <div className="md:hidden bg-white/98 backdrop-blur-3xl border-t border-slate-200 animate-fade-in">
                        <div className="px-4 pt-2 pb-8 space-y-1.5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition-all ${isActive(link.path)
                                        ? 'bg-slate-100 text-slate-900 shadow-sm'
                                        : 'text-slate-900'
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <link.icon size={18} /> {link.name}
                                </Link>
                            ))}

                            <div className="pt-3 mt-3 border-t border-white/10 space-y-1.5">
                                {user ? (
                                    <>
                                        {/* User info card */}
                                        <div className="flex items-center gap-3 px-4 py-4 bg-slate-50 rounded-xl mb-3 border border-slate-200">
                                            <div className="w-10 h-10 rounded-full bg-[#ffffff] flex items-center justify-center text-black text-sm font-black border border-slate-200 shadow-sm">
                                                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-black text-slate-900 truncate">{profile?.full_name || 'User'}</p>
                                                <span className={`text-[10px] font-black uppercase tracking-wider text-slate-500`}>{roleBadge.label}</span>
                                            </div>
                                        </div>
                                        <Link
                                            to={dashPath}
                                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-black text-slate-400 hover:bg-white/10 transition-all"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <LayoutDashboard size={18} /> Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-black text-red-500 hover:bg-red-500/5 transition-all"
                                        >
                                            <LogOut size={18} /> Log out
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-3 pt-2">
                                        <Link to="/login" className="block text-center py-3.5 text-sm font-black text-black rounded-xl hover:bg-white/10 transition-all"
                                            style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.8)' }}
                                            onClick={() => setIsOpen(false)}>
                                            Log in
                                        </Link>
                                        <Link to="/signup" className="btn-primary text-center block text-sm py-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]" onClick={() => setIsOpen(false)}>
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;
