import React, { useEffect, useState } from 'react';
import Hero from '../components/layout/Hero';
import Categories from '../components/layout/Categories';
import HowItWorks from '../components/layout/HowItWorks';
import PropertyCard from '../components/common/PropertyCard';
import { databases, DATABASE_ID, COLLECTION, Query, parseJsonField } from '../lib/appwrite';
import {
    ArrowRight, Shield, Zap, Star, Users, Home as HomeIcon,
    Search, CheckCircle2, MessageCircle, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const whys = [
    { icon: Shield, title: 'Every Listing Verified', desc: 'Our team personally reviews each property. Zero fake listings, guaranteed.', gradient: 'from-emerald-500 to-teal-600' },
    { icon: Zap, title: 'Direct Owner Connect', desc: 'Chat directly with owners via WhatsApp. No brokerage fees, no delays.', gradient: 'from-plum-600 to-indigo-700' },
    { icon: Star, title: 'Student-First Pricing', desc: 'All stays are budget-friendly and tailored for student lifestyles.', gradient: 'from-amber-400 to-orange-500' },
    { icon: Users, title: 'Thriving Community', desc: '12,000+ students have found their perfect stay through StaySetu.', gradient: 'from-rose-500 to-pink-600' },
];

const Home = () => {
    const [heroListing, setHeroListing] = useState(null);
    const [featuredListings, setFeaturedListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllHomeData = async () => {
            setLoading(true);
            try {
                // 1. Fetch the Hero (Modern Stay) listing first
                const heroRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION.listings,
                    [
                        Query.equal('status', 'approved'),
                        Query.equal('featured', true),
                        Query.orderDesc('$createdAt'),
                        Query.limit(1),
                    ]
                );

                let heroItem = null;
                if (heroRes.documents.length > 0) {
                    heroItem = heroRes.documents[0];
                } else {
                    // Fallback to latest if no featured
                    const latestRes = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTION.listings,
                        [
                            Query.equal('status', 'approved'),
                            Query.orderDesc('$createdAt'),
                            Query.limit(1),
                        ]
                    );
                    if (latestRes.documents.length > 0) heroItem = latestRes.documents[0];
                }

                // Parse hero item if exists
                if (heroItem) {
                    heroItem.images = parseJsonField(heroItem.images);
                    heroItem.amenities = parseJsonField(heroItem.amenities);
                }
                setHeroListing(heroItem);

                // 2. Fetch Popular Stays, EXCLUDING the hero listing
                const popularRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION.listings,
                    [
                        Query.equal('status', 'approved'),
                        Query.orderDesc('$createdAt'),
                        Query.limit(5),
                    ]
                );

                const filtered = heroItem
                    ? popularRes.documents.filter(d => d.$id !== heroItem.$id).slice(0, 3)
                    : popularRes.documents.slice(0, 3);

                // Parse filtered results
                const parsed = filtered.map(item => ({
                    ...item,
                    images: parseJsonField(item.images),
                    amenities: parseJsonField(item.amenities)
                }));
                setFeaturedListings(parsed);

            } catch (err) {
                console.error('Home Page Fetch Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllHomeData();
    }, []);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-surface">

            {/* Hero Section */}
            <Hero featuredProp={heroListing} />



            {/* Featured Listings */}
            <section className="py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="section-label mb-4 inline-block">Featured</span>
                        <h2 className="section-title text-slate-900" style={{ fontFamily: 'Bungee' }}>
                            Popular Stays
                        </h2>
                        <p className="text-slate-400 font-normal text-base mt-3 max-w-lg mx-auto">
                            Hand-picked, verified, and loved by thousands of students.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white/5 animate-pulse rounded-3xl" style={{ height: 360, border: '1px solid rgba(255,255,255,0.05)' }} />
                            ))}
                        </div>
                    ) : featuredListings.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredListings.map((listing) => (
                                    <PropertyCard key={listing.$id || listing.id} property={listing} />
                                ))}
                            </div>
                            <div className="text-center mt-12">
                                <Link to="/listings" className="btn-primary py-3 px-8 inline-flex items-center gap-2 text-sm">
                                    Explore All Stays <ArrowRight size={16} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 card-elevated rounded-[2rem] border border-dashed border-white/10">
                            <HomeIcon size={40} className="mx-auto text-slate-700 mb-4" />
                            <p className="text-slate-500 font-medium mb-6">No featured listings yet. Be the first!</p>
                            <Link to="/signup" className="btn-primary py-3 px-8">List Your Property</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Categories */}
            <Categories />

            {/* How It Works */}
            <HowItWorks />

            {/* Why StaySetu */}
            <section className="py-16 relative overflow-hidden bg-slate-50 border-y border-slate-100">
                <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="section-label mb-4 inline-block">Why Us</span>
                        <h2 className="section-title text-slate-900" style={{ fontFamily: 'Bungee' }}>
                            Built for Students, by Students
                        </h2>
                        <p className="text-slate-400 font-normal text-base mt-3 max-w-lg mx-auto">
                            Everything you need to find the perfect stay, stress-free.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {whys.map(({ icon: Icon, title, desc, gradient }, i) => (
                            <div key={i} className={`card-elevated p-8 group transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br ${gradient}`}>
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/20 backdrop-blur-md border border-white/30 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <Icon size={22} className="text-white" />
                                </div>
                                <h3 className="font-bold text-white mb-3 text-lg" style={{ fontFamily: 'Bungee' }}>{title}</h3>
                                <p className="text-white/80 text-sm leading-relaxed font-normal">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-[2rem] overflow-hidden p-12 md:p-20 text-center"
                        style={{
                            background: 'linear-gradient(135deg, #2D1B2E 0%, #3A1F3D 40%, #524058 100%)',
                        }}>
                        {/* Decorative orbs */}
                        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 blur-[100px]"
                            style={{ background: '#C4949E' }} />
                        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-20 blur-[100px]"
                            style={{ background: '#EDD9C4' }} />

                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white/80 text-xs font-medium px-4 py-2 rounded-full mb-6">
                                🏠 5,000+ Verified Stays
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: 'Bungee' }}>
                                Ready to Find Your<br className="hidden md:block" /> Perfect Stay?
                            </h2>
                            <p className="text-white/60 text-lg font-normal mb-10 max-w-2xl mx-auto">
                                Join 12,000+ students who found their home through StaySetu.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link
                                    to="/signup"
                                    className="w-full sm:w-auto bg-white text-plum-900 font-semibold py-3.5 px-10 rounded-2xl hover:bg-plum-50 transition-all active:scale-[0.97] text-sm"
                                    style={{ boxShadow: '0 4px 14px rgba(255,255,255,0.2)' }}
                                >
                                    Get Started — It's Free
                                </Link>
                                <Link
                                    to="/listings"
                                    className="w-full sm:w-auto bg-white/10 text-white font-medium py-3.5 px-10 rounded-2xl border border-white/10 hover:bg-white/15 transition-all active:scale-[0.97] text-sm flex items-center justify-center gap-2"
                                >
                                    Browse Stays <ArrowRight size={15} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
