import React, { useState, useEffect } from 'react';
import { Search, Home, ArrowRight, Sparkles, MapPin, CheckCircle2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { databases, DATABASE_ID, COLLECTION, Query, parseJsonField } from '../../lib/appwrite';

const Hero = ({ featuredProp }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [type, setType] = useState('all');
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [featuredListing, setFeaturedListing] = useState(featuredProp || null);
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

        if (!featuredProp) {
            const fetchFeaturedData = async () => {
                try {
                    // Try to get Admin-tagged "Modern Stays" first
                    const res = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTION.listings,
                        [
                            Query.equal('status', 'approved'),
                            Query.equal('featured', true),
                            Query.orderDesc('$createdAt'),
                            Query.limit(1),
                        ]
                    );

                    if (res.documents.length > 0) {
                        const data = { ...res.documents[0] };
                        data.images = parseJsonField(data.images);
                        data.amenities = parseJsonField(data.amenities);
                        setFeaturedListing(data);
                    } else {
                        const latestRes = await databases.listDocuments(
                            DATABASE_ID,
                            COLLECTION.listings,
                            [
                                Query.equal('status', 'approved'),
                                Query.orderDesc('$createdAt'),
                                Query.limit(1),
                            ]
                        );
                        if (latestRes.documents.length > 0) {
                            const data = { ...latestRes.documents[0] };
                            data.images = parseJsonField(data.images);
                            data.amenities = parseJsonField(data.amenities);
                            setFeaturedListing(data);
                        }
                    }
                } catch (err) {
                    console.error('Fetch error:', err);
                }
            };
            fetchFeaturedData();
        }
    }, [featuredProp]);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/listings?q=${searchQuery}&type=${type}`);
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
        <div className="relative min-h-[95vh] flex items-center overflow-hidden bg-white">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[55%] h-full bg-slate-50 opacity-40 -skew-x-[15deg] translate-x-1/4 -z-0" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-plum-100/20 rounded-full blur-[120px] -z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

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
                            <motion.span variants={text3DVariants} className="block text-plum-600 transform-gpu origin-bottom">Student</motion.span>
                            <motion.span variants={text3DVariants} className="block transform-gpu origin-bottom">Living.</motion.span>
                        </h1>

                        <motion.p variants={text3DVariants} className="text-lg text-slate-500 font-medium max-w-lg mb-12 leading-relaxed">
                            Vetted PGs, Hostels, and Flats designed for student life. No brokerage, and verified listings.
                        </motion.p>

                        <motion.div variants={text3DVariants} className="w-full max-w-2xl mb-12">
                            <form onSubmit={handleSearch} className="relative group">
                                <div className="absolute inset-0 bg-slate-900 rounded-[2rem] translate-x-1.5 translate-y-1.5 group-focus-within:translate-x-2.5 group-focus-within:translate-y-2.5 transition-transform" />
                                <div className="relative flex flex-col md:flex-row items-center gap-2 p-2 bg-white border-2 border-slate-900 rounded-[2rem]">
                                    <div className="flex-1 w-full flex items-center px-4 gap-3">
                                        <Search className="text-slate-400 shrink-0" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Where's your college?"
                                            className="w-full py-3 focus:outline-none text-slate-900 font-bold placeholder:text-slate-400 text-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full md:w-auto bg-slate-900 text-white py-3 px-8 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors"
                                    >
                                        Find <ArrowRight size={16} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                        <motion.div variants={text3DVariants} className="flex items-center gap-10">
                            <div>
                                <h4 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>12K</h4>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Trusted Students</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div>
                                <h4 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>500+</h4>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Verified Stays</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="lg:col-span-5 relative mt-20 lg:mt-0 flex justify-center lg:block cursor-pointer" onClick={() => featuredListing && navigate(`/property/${featuredListing.$id || featuredListing.id}`)}>
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
                                        src={parseJsonField(featuredListing?.images)[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-white border-2 border-slate-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                        {featuredListing?.type || 'Featured'} {featuredListing?.type === 'Flat' ? 'Flat' : 'PG'}
                                    </div>
                                </div>
                                <div className="px-2">
                                    <div className="flex justify-between items-center mb-1 gap-2">
                                        <h3 className="text-xl font-bold text-slate-900 truncate" style={{ fontFamily: 'Bungee' }}>
                                            {featuredListing?.title || 'Modern Stay'}
                                        </h3>
                                        <div className="text-plum-600 font-bold shrink-0">
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
