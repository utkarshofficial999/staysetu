import React, { useState } from 'react';
import { Search, Home, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [type, setType] = useState('all');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/listings?q=${searchQuery}&type=${type}`);
    };

    return (
        <div className="relative pt-20 pb-8 md:pt-28 md:pb-14 overflow-hidden">

            {/* Mesh gradient background */}
            <div className="absolute inset-0 bg-mesh pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

                {/* Badge */}
                <div className="flex justify-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2.5 bg-white border border-slate-200/60 px-5 py-2.5 rounded-full text-[13px] font-medium text-slate-600"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <span className="flex relative">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <Sparkles size={13} className="text-primary-900" />
                        <span>India's #1 Student Housing Platform</span>
                    </div>
                </div>

                {/* Headline */}
                <div className="text-center max-w-4xl mx-auto mb-10 animate-slide-up">
                    <h1 className="text-5xl md:text-[5.5rem] font-bold mb-6 leading-[0.95] tracking-tight"
                        style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                        <span className="block text-slate-900">Your New</span>
                        <span className="block py-1" style={{
                            background: 'linear-gradient(135deg, #3A1F3D 0%, #524058 40%, #C4949E 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Home Away
                        </span>
                        <span className="block text-slate-900">from Home</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-normal max-w-xl mx-auto leading-relaxed">
                        Discover verified PGs, flats & hostels near your college.
                        Safe, affordable, and just a search away.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <form
                        onSubmit={handleSearch}
                        className="bg-white p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2"
                        style={{ boxShadow: '0 4px 24px rgba(58,31,61,0.08), 0 1px 3px rgba(0,0,0,0.04)', border: '1px solid rgba(58,31,61,0.06)' }}
                    >
                        <div className="flex-1 w-full flex items-center px-3 gap-2.5 border-b md:border-b-0 md:border-r border-slate-100">
                            <Search className="text-primary-400 shrink-0" size={18} />
                            <input
                                type="text"
                                placeholder="Search area, college, or landmark..."
                                className="w-full py-3 focus:outline-none text-slate-800 font-medium placeholder:text-slate-400 bg-transparent text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-auto flex items-center gap-2 px-3 py-1">
                            <Home className="text-primary-300 shrink-0" size={16} />
                            <select
                                className="w-full md:w-32 py-1.5 focus:outline-none text-slate-600 font-medium bg-transparent cursor-pointer text-sm"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="all">Any Type</option>
                                <option value="PG">PG</option>
                                <option value="Flat">Flat</option>
                                <option value="Hostel">Hostel</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full md:w-auto btn-primary py-3 px-6 flex items-center justify-center gap-2 group text-sm"
                        >
                            Search
                            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <a
                        href="/listings"
                        className="btn-secondary flex items-center justify-center gap-2 py-3 px-7 text-sm"
                    >
                        Browse All Stays <ArrowRight size={15} />
                    </a>
                    <a
                        href="/signup"
                        className="flex items-center justify-center gap-2 text-slate-500 font-medium py-3 px-7 rounded-2xl hover:bg-white hover:text-slate-900 transition-all text-sm"
                    >
                        List Your Property
                    </a>
                </div>

            </div>
        </div>
    );
};

export default Hero;
