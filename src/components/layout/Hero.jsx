import React, { useState, useEffect } from 'react';
import { Search, Home, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [type, setType] = useState('all');
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const played = sessionStorage.getItem('hero-3d-played-v2');
        if (!played) {
            setShouldAnimate(true);
            sessionStorage.setItem('hero-3d-played-v2', 'true');
        }
    }, []);

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
            y: 80,
            rotateX: -90,
            transformPerspective: 1000
        },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 100,
                duration: 1.2
            }
        }
    };

    return (
        <div className="relative pt-20 pb-8 md:pt-28 md:pb-14 overflow-hidden">

            {/* Mesh gradient background */}
            <div className="absolute inset-0 bg-mesh pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">



                {/* Headline */}
                <motion.div
                    className="text-center max-w-4xl mx-auto mb-10"
                    variants={containerVariants}
                    initial={shouldAnimate ? "hidden" : "visible"}
                    animate="visible"
                >
                    <h1 className="text-5xl md:text-[5.5rem] font-bold mb-6 leading-[0.95] tracking-tight"
                        style={{ fontFamily: 'Bungee, cursive' }}>
                        <motion.span
                            variants={text3DVariants}
                            className="block text-slate-900"
                        >
                            Your New
                        </motion.span>
                        <motion.span
                            variants={text3DVariants}
                            className="block py-1"
                            style={{
                                background: 'linear-gradient(135deg, #3A1F3D 0%, #C4949E 40%, #524058 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Home Away
                        </motion.span>
                        <motion.span
                            variants={text3DVariants}
                            className="block text-slate-900"
                        >
                            from Home
                        </motion.span>
                    </h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="text-lg text-slate-400 font-normal max-w-xl mx-auto leading-relaxed"
                    >
                        Discover verified PGs, flats & hostels near your college.
                        Safe, affordable, and just a search away.
                    </motion.p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={shouldAnimate ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="max-w-4xl mx-auto mb-12"
                >
                    <form onSubmit={handleSearch} className="search-poda">
                        <div className="search-glow-effect"></div>
                        <div className="search-border-premium"></div>
                        <div className="search-white-blur"></div>

                        <div className="search-main flex flex-col md:flex-row items-center gap-2 p-1.5 md:p-2 !bg-white">
                            <div className="flex-1 w-full flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100">
                                <Search className="text-plum-400 shrink-0" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search area, college, or landmark..."
                                    className="w-full py-3.5 focus:outline-none text-slate-900 font-medium placeholder:text-slate-400 bg-transparent text-sm md:text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="w-full md:w-auto flex items-center gap-2 px-4 py-2">
                                <Home className="text-plum-300 shrink-0" size={18} />
                                <select
                                    className="w-full md:w-36 py-2 focus:outline-none text-slate-900 font-bold bg-transparent cursor-pointer text-sm"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="all" className="bg-white">Any Type</option>
                                    <option value="PG" className="bg-white">PG</option>
                                    <option value="Flat" className="bg-white">Flat</option>
                                    <option value="Hostel" className="bg-white">Hostel</option>
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
                </motion.div>

                {/* CTA buttons */}
                <motion.div
                    initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="flex flex-col sm:flex-row justify-center gap-3"
                >
                    <a
                        href="/listings"
                        className="btn-secondary flex items-center justify-center gap-2 py-3 px-7 text-sm"
                    >
                        Browse All Stays <ArrowRight size={15} />
                    </a>
                    <a
                        href="/signup"
                        className="flex items-center justify-center gap-2 text-slate-400 font-medium py-3 px-7 rounded-2xl hover:bg-slate-50 hover:text-plum-900 transition-all text-sm"
                    >
                        List Your Property
                    </a>
                </motion.div>

            </div>
        </div>
    );
};

export default Hero;
