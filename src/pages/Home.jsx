import React, { useEffect, useState } from 'react';
import Hero from '../components/layout/Hero';
import Categories from '../components/layout/Categories';
import HowItWorks from '../components/layout/HowItWorks';
import PropertyCard from '../components/common/PropertyCard';
import { supabase } from '../lib/supabase';
import {
    ArrowRight, Shield, Zap, Star, Users, Home as HomeIcon,
    Search, CheckCircle2, MessageCircle, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const whys = [
    { icon: Shield, title: 'Every Listing Verified', desc: 'Our team personally reviews each property. Zero fake listings, guaranteed.' },
    { icon: Zap, title: 'Direct Owner Connect', desc: 'Chat directly with owners via WhatsApp. No brokerage fees, no delays.' },
    { icon: Star, title: 'Student-First Pricing', desc: 'All stays are budget-friendly and tailored for student lifestyles.' },
    { icon: Users, title: 'Thriving Community', desc: '12,000+ students have found their perfect stay through StaySetu.' },
];

const Home = () => {
    const [featuredListings, setFeaturedListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            const { data } = await supabase
                .from('listings')
                .select('*')
                .eq('status', 'approved')
                .limit(4);

            if (data) setFeaturedListings(data);
            setLoading(false);
        };
        fetchFeatured();
    }, []);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-slate-50">

            {/* Hero Section */}
            <Hero />

            {/* Quick Category Pills */}
            <section className="pb-4 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center gap-2 flex-wrap">
                        {[
                            { label: 'Boys PG', emoji: '🏠', type: 'PG' },
                            { label: 'Girls PG', emoji: '🏡', type: 'PG' },
                            { label: 'Flat', emoji: '🏢', type: 'Flat' },
                            { label: 'Hostel', emoji: '🏨', type: 'Hostel' },
                        ].map(({ label, emoji, type }) => (
                            <Link
                                key={label}
                                to={`/listings?type=${type}`}
                                className="px-4 py-2 bg-white border border-slate-200/60 text-slate-600 rounded-xl text-[13px] font-medium transition-all duration-200 hover:border-plum-200 hover:text-plum-900 hover:bg-plum-50 hover:-translate-y-0.5"
                                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                            >
                                {emoji} {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Listings */}
            <section className="py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <span className="section-label mb-4 inline-block">Featured</span>
                        <h2 className="section-title" style={{ fontFamily: 'Space Grotesk' }}>
                            Popular Stays
                        </h2>
                        <p className="text-slate-500 font-normal text-base mt-2 max-w-lg mx-auto">
                            Hand-picked, verified, and loved by thousands of students.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white animate-pulse rounded-3xl" style={{ height: 360, border: '1px solid rgba(0,0,0,0.04)' }} />
                            ))}
                        </div>
                    ) : featuredListings.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {featuredListings.map((listing) => (
                                    <PropertyCard key={listing.id} property={listing} />
                                ))}
                            </div>
                            <div className="text-center mt-12">
                                <Link to="/listings" className="btn-primary py-3 px-8 inline-flex items-center gap-2 text-sm">
                                    Explore All Stays <ArrowRight size={16} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 card-elevated rounded-[2rem] border border-dashed border-slate-200">
                            <HomeIcon size={40} className="mx-auto text-slate-300 mb-4" />
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
            <section className="py-14 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <span className="section-label mb-4 inline-block">Why Us</span>
                        <h2 className="section-title" style={{ fontFamily: 'Space Grotesk' }}>
                            Built for Students, by Students
                        </h2>
                        <p className="text-slate-500 font-normal text-base mt-2 max-w-lg mx-auto">
                            Everything you need to find the perfect stay, stress-free.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {whys.map(({ icon: Icon, title, desc }, i) => (
                            <div key={i} className="card-elevated p-7 group">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                                    style={{ background: 'linear-gradient(135deg, #3A1F3D, #524058)', boxShadow: '0 8px 20px -4px rgba(58,31,61,0.25)' }}>
                                    <Icon size={22} className="text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2 text-lg" style={{ fontFamily: 'Space Grotesk' }}>{title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-normal">{desc}</p>
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
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
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
