import React, { useState, useEffect, useRef } from 'react';
import { Search, Home, ArrowRight, Sparkles, MapPin, CheckCircle2, Users, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { databases, DATABASE_ID, COLLECTION, Query, parseJsonField } from '../../lib/appwrite';

const Hero = ({ featuredProp }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const [type, setType] = useState('all');
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [featuredListing, setFeaturedListing] = useState(featuredProp || null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const navigate = useNavigate();

    // Sync with prop changes
    useEffect(() => {
        if (featuredProp) {
            setFeaturedListing(featuredProp);
        }
    }, [featuredProp]);

    useEffect(() => {
        const played = sessionStorage.getItem('hero-3d-played-v3');
        if (!played) {
            setShouldAnimate(true);
            sessionStorage.setItem('hero-3d-played-v3', 'true');
        }

        const fetchData = async () => {
            try {
                // Fetch top listings to build suggestions
                const res = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION.listings,
                    [
                        Query.equal('status', 'approved'),
                        Query.orderDesc('viewsCount'),
                        Query.limit(100),
                    ]
                );

                if (res.documents.length > 0) {
                    // Extract unique locations, titles, and colleges
                    const vals = new Set();
                    res.documents.forEach(doc => {
                        if (doc.location) vals.add(doc.location);
                        if (doc.title) vals.add(doc.title);
                        if (doc.college) vals.add(doc.college);
                        // Also common areas if they exist in location
                        const parts = doc.location.split(',');
                        if (parts.length > 0) vals.add(parts[0].trim());
                    });
                    setSuggestions(Array.from(vals));

                    // Set featured listing if not provided
                    if (!featuredProp) {
                        const featured = res.documents.find(d => d.featured) || res.documents[0];
                        const data = { ...featured };
                        data.images = parseJsonField(data.images);
                        data.amenities = parseJsonField(data.amenities);
                        setFeaturedListing(data);
                    }
                }
            } catch (err) {
                console.error('Fetch suggestions error:', err);
            }
        };

        fetchData();

        // Click outside handler
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [featuredProp]);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/listings?q=${searchQuery}&type=${type}`);
    };

    const handleLiveLocation = () => {
        setLoadingLocation(true);
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                navigate(`/listings?lat=${latitude}&lng=${longitude}`);
                setLoadingLocation(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Unable to retrieve your location. Please check your permissions.");
                setLoadingLocation(false);
            }
        );
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const text3DVariants = {
        hidden: {
            opacity: 0,
            y: 40,
            rotateX: -90,
        },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 100,
            }
        }
    };

    const displayAmenities = parseJsonField(featuredListing?.amenities).length > 0
        ? parseJsonField(featuredListing?.amenities).slice(0, 3)
        : ['WiFi', 'AC', 'Power'];

    return (
        <div className="relative min-h-[70vh] lg:min-h-[85vh] flex items-center bg-surface">
            {/* Background elements - Clipped here instead of the whole Hero */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
                <div className="absolute top-0 right-0 w-[55%] h-full bg-slate-50 opacity-40 -skew-x-[15deg] translate-x-1/4" />
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-plum-100/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 lg:pb-12 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* Left - Content & Search */}
                    <motion.div
                        className="lg:col-span-7"
                        variants={containerVariants}
                        initial={shouldAnimate ? "hidden" : "visible"}
                        animate="visible"
                    >

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1] tracking-tight text-slate-900"
                            style={{ fontFamily: 'Bungee, cursive', perspective: '1000px' }}>
                            <motion.span variants={text3DVariants} className="block transform-gpu origin-bottom">Better</motion.span>
                            <motion.span variants={text3DVariants} className="block text-[#8B5E6B] transform-gpu origin-bottom">Student</motion.span>
                            <motion.span variants={text3DVariants} className="block transform-gpu origin-bottom">Living.</motion.span>
                        </h1>

                        <motion.p variants={text3DVariants} className="text-lg text-slate-500 font-medium max-w-lg mb-8 leading-relaxed">
                            A smarter way to find your next stay with verified listings and trusted property connections you can rely on
                        </motion.p>

                        <motion.button
                            variants={text3DVariants}
                            onClick={handleLiveLocation}
                            disabled={loadingLocation}
                            className="flex items-center gap-2 mb-6 md:mb-10 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl border-2 border-emerald-100 font-bold text-xs hover:bg-emerald-100 transition-all hover:-translate-y-0.5"
                        >
                            <Navigation size={14} className={loadingLocation ? 'animate-spin' : ''} />
                            {loadingLocation ? 'Getting location...' : 'Find Properties Near Me'}
                        </motion.button>

                        <motion.div variants={text3DVariants} className="w-full max-w-2xl mb-8 md:mb-12">
                            <form onSubmit={handleSearch} className="relative group" ref={searchRef}>
                                <div className="absolute inset-0 bg-slate-900 rounded-[2rem] translate-x-1.5 translate-y-1.5 group-focus-within:translate-x-2.5 group-focus-within:translate-y-2.5 transition-transform" />
                                <div className="relative flex flex-col md:flex-row items-center gap-2 p-2 bg-white border-2 border-slate-900 rounded-[2rem]">
                                    <div className="flex-1 w-full flex items-center px-4 gap-3">
                                        <Search className="text-slate-400 shrink-0" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Where's your college?"
                                            className="w-full py-3 focus:outline-none text-slate-900 font-bold placeholder:text-slate-400 text-sm"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSearchQuery(val);
                                                if (val.length > 1) {
                                                    const filtered = suggestions.filter(s =>
                                                        s.toLowerCase().includes(val.toLowerCase())
                                                    ).slice(0, 5);
                                                    setFilteredSuggestions(filtered);
                                                    setShowSuggestions(filtered.length > 0);
                                                } else {
                                                    setShowSuggestions(false);
                                                }
                                            }}
                                            onFocus={() => {
                                                if (searchQuery.length > 1 && filteredSuggestions.length > 0) {
                                                    setShowSuggestions(true);
                                                }
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full md:w-auto bg-slate-900 text-white py-3 px-8 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors"
                                    >
                                        Find <ArrowRight size={16} />
                                    </button>
                                </div>

                                {/* Suggestions Dropdown */}
                                {showSuggestions && (
                                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-slate-900 rounded-3xl shadow-[8px_8px_0px_#0f172a] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-2">
                                            {filteredSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchQuery(suggestion);
                                                        setShowSuggestions(false);
                                                        navigate(`/listings?q=${suggestion}&type=${type}`);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left rounded-2xl transition-colors group/item"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-blue-100 group-hover/item:text-blue-500 transition-colors">
                                                        <MapPin size={14} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 group-hover/item:text-blue-600 transition-colors">{suggestion}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </form>
                        </motion.div>

                    </motion.div>

                    <div className="lg:col-span-5 relative mt-6 md:mt-10 lg:mt-0 flex justify-center lg:block cursor-pointer" onClick={() => featuredListing && navigate(`/property/${featuredListing.$id || featuredListing.id}`)}>
                        <motion.div
                            initial={{ x: 60, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Floating Card Stack */}
                            <div className="relative z-10 p-4 md:p-5 bg-white border-2 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] shadow-[12px_12px_0px_#0f172a] md:shadow-[20px_20px_0px_#0f172a] transform rotate-1 md:rotate-3 scale-95 md:scale-110">
                                <div className="aspect-[16/11] rounded-[2rem] overflow-hidden mb-6 border-2 border-slate-900 relative bg-slate-100">
                                    <img
                                        src={parseJsonField(featuredListing?.images)[0] || "/hero-brand.png?v=6"}
                                        alt="StaySetu Banner"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-white border-2 border-slate-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                        {featuredListing?.type || 'Featured'}
                                    </div>
                                </div>
                                <div className="px-2">
                                    <div className="flex justify-between items-center mb-1 gap-2">
                                        <h3 className="text-xl font-bold text-slate-900 truncate" style={{ fontFamily: 'Bungee' }}>
                                            {featuredListing?.title || 'Modern Stay'}
                                        </h3>
                                        <div className="text-blue-600 font-bold shrink-0">
                                            ₹{(Number(featuredListing?.price) || 8500).toLocaleString()}/mo
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mb-4">
                                        <MapPin size={12} /> {featuredListing?.location || 'Near Galgotias University'}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {displayAmenities.map(tag => (
                                            <span key={tag} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>


                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-6 -left-2 md:-bottom-8 md:-left-12 z-20 bg-amber-400 text-slate-900 border-2 border-slate-900 px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-[6px_6px_0px_#0f172a] md:shadow-[8px_8px_0px_#0f172a]"
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">AI Smart<br />Match</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Hero;
