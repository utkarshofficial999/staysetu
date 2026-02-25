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
                        <span className="block text-white">Your New</span>
                        <span className="block py-1" style={{
                            background: 'linear-gradient(135deg, #EDD9C4 0%, #C4949E 40%, #ddb5c5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Home Away
                        </span>
                        <span className="block text-white">from Home</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-normal max-w-xl mx-auto leading-relaxed">
                        Discover verified PGs, flats & hostels near your college.
                        Safe, affordable, and just a search away.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <form onSubmit={handleSearch} className="search-poda">
                        <div className="search-glow-effect"></div>
                        <div className="search-border-premium"></div>
                        <div className="search-white-blur"></div>

                        <div className="search-main flex flex-col md:flex-row items-center gap-2 p-1.5 md:p-2 !bg-[#141114]">
                            <div className="flex-1 w-full flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-white/5">
                                <Search className="text-plum-400 shrink-0" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search area, college, or landmark..."
                                    className="w-full py-3.5 focus:outline-none text-white font-medium placeholder:text-slate-500 bg-transparent text-sm md:text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="w-full md:w-auto flex items-center gap-2 px-4 py-2">
                                <Home className="text-plum-300 shrink-0" size={18} />
                                <select
                                    className="w-full md:w-36 py-2 focus:outline-none text-slate-300 font-bold bg-transparent cursor-pointer text-sm"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="all" className="bg-[#141114]">Any Type</option>
                                    <option value="PG" className="bg-[#141114]">PG</option>
                                    <option value="Flat" className="bg-[#141114]">Flat</option>
                                    <option value="Hostel" className="bg-[#141114]">Hostel</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full md:w-auto btn-primary py-3.5 px-10 flex items-center justify-center gap-2 group text-sm md:text-base font-bold"
                            >
                                Search
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
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
                        className="flex items-center justify-center gap-2 text-slate-400 font-medium py-3 px-7 rounded-2xl hover:bg-white/5 hover:text-white transition-all text-sm"
                    >
                        List Your Property
                    </a>
                </div>

            </div>
        </div>
    );
};

export default Hero;
