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
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-[#151515]/95 backdrop-blur-3xl shadow-[0_0_25px_rgba(57,255,20,0.2)]'
                    : 'bg-[#1f1f1f]/90 backdrop-blur-2xl'
                    }`}
                style={{ borderBottom: '1px solid rgba(57, 255, 20, 0.25)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-17 items-center">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                                style={{ background: '#39ff14' }}>
                                <span className="text-black font-black text-xl" style={{ fontFamily: 'Space Grotesk' }}>S</span>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-black"
                                style={{
                                    fontFamily: 'Space Grotesk',
                                    textShadow: '0 0 10px rgba(57, 255, 20, 0.8), 0 0 20px rgba(57, 255, 20, 0.4)'
                                }}>
                                StaySetu
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative px-4 py-2 rounded-xl text-[14px] font-black transition-all duration-200 ${isActive(link.path)
                                        ? 'bg-[#39ff14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]'
                                        : 'text-black hover:bg-[#39ff14]/10'
                                        }`}
                                    style={{
                                        textShadow: !isActive(link.path) ? '0 0 8px rgba(57, 255, 20, 0.9), 0 0 15px rgba(57, 255, 20, 0.3)' : 'none'
                                    }}
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
                                        className="flex items-center gap-2 bg-[#39ff14]/5 hover:bg-[#39ff14]/15 border border-[#39ff14]/20 pl-1.5 pr-3 py-1.5 rounded-full transition-all duration-200"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-[#39ff14] flex items-center justify-center text-black text-xs font-black">
                                            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-black text-black" style={{ textShadow: '0 0 8px rgba(57, 255, 20, 0.7)' }}>
                                            {profile?.full_name?.split(' ')[0] || 'User'}
                                        </span>
                                        <ChevronDown size={14} className={`text-black transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {dropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-[#39ff14]/30 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 py-2 animate-fade-in origin-top-right">
                                                {/* User info */}
                                                <div className="px-4 py-3 border-b border-[#39ff14]/10">
                                                    <p className="text-sm font-black text-white truncate">{profile?.full_name || user.email}</p>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                                                    <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#39ff14]/20 text-[#39ff14]`}>
                                                        {roleBadge.label}
                                                    </span>
                                                </div>
                                                <Link
                                                    to={dashPath}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-black text-slate-400 hover:bg-[#39ff14]/10 hover:text-white transition-colors"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <LayoutDashboard size={15} /> Dashboard
                                                </Link>
                                                <div className="h-px bg-[#39ff14]/10 my-1" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-black text-red-400 hover:bg-red-400/10 transition-colors"
                                                >
                                                    <LogOut size={15} /> Log out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="text-[14px] font-black text-black px-4 py-2 rounded-xl hover:bg-[#39ff14]/10 transition-all"
                                        style={{ textShadow: '0 0 8px rgba(57, 255, 20, 0.7)' }}>
                                        Log in
                                    </Link>
                                    <Link to="/signup" className="btn-primary py-2.5 px-6 text-[14px]">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-black transition-all"
                            style={{ filter: 'drop-shadow(0 0 5px rgba(57, 255, 20, 0.8))' }}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {isOpen && (
                    <div className="md:hidden bg-[#1a1a1a]/98 backdrop-blur-3xl border-t border-[#39ff14]/20 animate-fade-in">
                        <div className="px-4 pt-2 pb-8 space-y-1.5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition-all ${isActive(link.path)
                                        ? 'bg-[#39ff14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]'
                                        : 'text-black'
                                        }`}
                                    style={{
                                        textShadow: !isActive(link.path) ? '0 0 8px rgba(57, 255, 20, 0.9)' : 'none'
                                    }}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <link.icon size={18} /> {link.name}
                                </Link>
                            ))}

                            <div className="pt-3 mt-3 border-t border-[#39ff14]/10 space-y-1.5">
                                {user ? (
                                    <>
                                        {/* User info card */}
                                        <div className="flex items-center gap-3 px-4 py-4 bg-[#39ff14]/5 rounded-xl mb-3 border border-[#39ff14]/10">
                                            <div className="w-10 h-10 rounded-full bg-[#39ff14] flex items-center justify-center text-black text-sm font-black">
                                                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-black text-white truncate">{profile?.full_name || 'User'}</p>
                                                <span className={`text-[10px] font-black uppercase tracking-wider text-[#39ff14]`}>{roleBadge.label}</span>
                                            </div>
                                        </div>
                                        <Link
                                            to={dashPath}
                                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-black text-slate-400 hover:bg-[#39ff14]/10 transition-all"
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
                                        <Link to="/login" className="block text-center py-3.5 text-sm font-black text-black rounded-xl hover:bg-[#39ff14]/10 transition-all"
                                            style={{ textShadow: '0 0 8px rgba(57, 255, 20, 0.8)' }}
                                            onClick={() => setIsOpen(false)}>
                                            Log in
                                        </Link>
                                        <Link to="/signup" className="btn-primary text-center block text-sm py-4 shadow-[0_0_20px_rgba(57,255,20,0.3)]" onClick={() => setIsOpen(false)}>
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
