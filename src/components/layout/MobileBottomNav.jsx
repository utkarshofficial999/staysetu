import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Users, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
    const location = useLocation();
    const { user, profile } = useAuth();

    const isActive = (path) => location.pathname === path;

    const role = profile?.role || 'student';
    const dashPath = role === 'owner' ? '/owner-dashboard' : '/dashboard';

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-lg animate-slide-up">
            <div className="bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-2 flex items-center justify-between pointer-events-auto">

                {/* Home */}
                <Link
                    to="/"
                    className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${isActive('/') ? 'text-black scale-110' : 'text-slate-400 opacity-60'}`}
                >
                    <Home size={20} weight={isActive('/') ? 'fill' : 'regular'} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
                </Link>

                {/* Roommates */}
                <Link
                    to="/roommates"
                    className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${isActive('/roommates') ? 'text-black scale-110' : 'text-slate-400 opacity-60'}`}
                >
                    <Users size={20} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Pals</span>
                </Link>

                {/* CENTRAL BROWSE BUTTON */}
                <div className="relative -top-8 px-2 group">
                    <Link
                        to="/listings"
                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-300 active:scale-95 border-4 border-white ${isActive('/listings')
                            ? 'bg-black text-white'
                            : 'bg-white text-black'
                            }`}
                    >
                        <Search size={24} strokeWidth={3} />
                    </Link>
                    <div className="absolute top-18 left-1/2 -translate-x-1/2 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive('/listings') ? 'text-black' : 'text-slate-400 opacity-60'}`}>Browse</span>
                    </div>
                </div>

                {/* Dashboard */}
                <Link
                    to={dashPath}
                    className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${isActive(dashPath) ? 'text-black scale-110' : 'text-slate-400 opacity-60'}`}
                >
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Dash</span>
                </Link>

                {/* Profile/Login */}
                <Link
                    to={user ? "/dashboard" : "/login"}
                    className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${isActive('/login') || isActive('/signup') ? 'text-black scale-110' : 'text-slate-400 opacity-60'}`}
                >
                    {user ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border uppercase transition-all ${isActive('/dashboard') ? 'bg-black text-white border-black' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {(profile?.fullName || profile?.name || 'U').charAt(0)}
                        </div>
                    ) : (
                        <User size={20} />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-tighter">{user ? 'Me' : 'Join'}</span>
                </Link>

            </div>
        </div>
    );
};

export default MobileBottomNav;
