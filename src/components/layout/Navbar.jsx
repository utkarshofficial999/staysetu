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
        owner: { bg: 'bg-violet-50', text: 'text-violet-600', label: 'Owner' },
        student: { bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Student' },
    }[role] || { bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Student' };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                    : 'bg-white/60 backdrop-blur-xl'
                    }`}
                style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
                            <div className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:shadow-glow"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>S</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight gradient-text" style={{ fontFamily: 'Space Grotesk' }}>
                                StaySetu
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${isActive(link.path)
                                        ? 'text-indigo-600 bg-indigo-50'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Auth */}
                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 pl-1.5 pr-3 py-1.5 rounded-full transition-all duration-200"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
                                            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                                            {profile?.full_name?.split(' ')[0] || 'User'}
                                        </span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {dropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-premium z-50 py-2 animate-fade-in origin-top-right">
                                                {/* User info */}
                                                <div className="px-4 py-3 border-b border-slate-50">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || user.email}</p>
                                                    <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                                                    <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${roleBadge.bg} ${roleBadge.text}`}>
                                                        {role === 'admin' && <ShieldCheck size={10} />}
                                                        {roleBadge.label}
                                                    </span>
                                                </div>
                                                <Link
                                                    to={dashPath}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <LayoutDashboard size={15} /> Dashboard
                                                </Link>
                                                {role === 'admin' && (
                                                    <Link
                                                        to="/admin"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                                        onClick={() => setDropdownOpen(false)}
                                                    >
                                                        <ShieldCheck size={15} /> Admin Panel
                                                    </Link>
                                                )}
                                                <div className="h-px bg-slate-100 my-1" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={15} /> Log out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all">
                                        Log in
                                    </Link>
                                    <Link to="/signup" className="btn-primary py-2 px-5 text-[13px]">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {isOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-100/50 animate-fade-in">
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.path)
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <link.icon size={17} /> {link.name}
                                </Link>
                            ))}

                            <div className="pt-3 mt-2 border-t border-slate-100 space-y-1">
                                {user ? (
                                    <>
                                        {/* User info card */}
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-2">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                                                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || 'User'}</p>
                                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${roleBadge.text}`}>{roleBadge.label}</span>
                                            </div>
                                        </div>
                                        <Link
                                            to={dashPath}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <LayoutDashboard size={17} /> Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <LogOut size={17} /> Log out
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-2 pt-2">
                                        <Link to="/login" className="block text-center py-3 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all" onClick={() => setIsOpen(false)}>Log in</Link>
                                        <Link to="/signup" className="btn-primary text-center block text-sm py-3" onClick={() => setIsOpen(false)}>Get Started</Link>
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
