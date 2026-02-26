import React from 'react';
import { Link } from 'react-router-dom';
import { User, Users, Building, Home, ArrowUpRight } from 'lucide-react';

const categories = [
    {
        name: 'Boys PG',
        icon: User,
        gradient: 'from-plum-800 to-plum-900',
        description: 'Safe & verified PGs near colleges',
        type: 'PG',
        gender: 'male',
    },
    {
        name: 'Girls PG',
        icon: Users,
        gradient: 'from-plum-400 to-plum-600',
        description: 'Secure stays with women-only options',
        type: 'PG',
        gender: 'female',
    },
    {
        name: 'Flats',
        icon: Home,
        gradient: 'from-plum-700 to-plum-800',
        description: 'Fully furnished flats for students',
        type: 'Flat',
    },
    {
        name: 'Hostels',
        icon: Building,
        gradient: 'from-plum-600 to-plum-700',
        description: 'Budget-friendly hostel rooms',
        type: 'Hostel',
    },
];

const Categories = () => {
    return (
        <section className="relative py-16 bg-white overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-xl">
                        <span className="section-label mb-4 block w-fit">Discovery</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Bungee' }}>
                            Find Your Perfect <span className="text-plum-600">Space</span>
                        </h2>
                        <p className="text-slate-500 font-normal mt-4 text-base leading-relaxed">
                            We've organized the best student housing options into clear categories to help you find your new home faster.
                        </p>
                    </div>
                    <Link to="/listings" className="group flex items-center gap-3 text-slate-900 font-black text-sm uppercase tracking-widest bg-slate-50 px-6 py-3 rounded-2xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all duration-300">
                        View All Listings <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-5 h-auto md:h-[600px]">

                    {/* Girls PG - Featured Bento */}
                    <Link
                        to="/listings?type=PG&gender=female"
                        className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[2.5rem] border-2 border-slate-900 bg-rose-50 p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_50px_rgba(225,29,72,0.1)]"
                    >
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] mb-8">
                                <Users size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Bungee' }}>Girls PG</h3>
                            <p className="text-slate-600 font-medium max-w-[240px] leading-relaxed">Premium, highly secure accommodations specifically designed for female students.</p>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-widest mt-8">
                            Explore Safety First <ArrowUpRight size={14} />
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-rose-200/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    </Link>

                    {/* Boys PG */}
                    <Link
                        to="/listings?type=PG&gender=male"
                        className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] border-2 border-slate-900 bg-blue-50 p-6 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)]"
                    >
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-500 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] mb-6">
                                <User size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Bungee' }}>Boys PG</h3>
                        </div>
                        <p className="text-slate-600 text-xs font-medium relative z-10">Verified stays near major college hubs.</p>
                    </Link>

                    {/* Flats */}
                    <Link
                        to="/listings?type=Flat"
                        className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] border-2 border-slate-900 bg-amber-50 p-6 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_50px_rgba(245,158,11,0.1)]"
                    >
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] mb-6">
                                <Home size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Bungee' }}>Flats</h3>
                        </div>
                        <p className="text-slate-600 text-xs font-medium relative z-10">Independent living for 2-4 friends.</p>
                    </Link>

                    {/* Hostels */}
                    <Link
                        to="/listings?type=Hostel"
                        className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] border-2 border-slate-900 bg-indigo-50 p-7 flex flex-row items-center justify-between transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)]"
                    >
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-500 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] mb-6">
                                <Building size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Bungee' }}>Hostels</h3>
                            <p className="text-slate-600 text-sm font-medium mt-2">Budget-friendly community living.</p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="w-24 h-24 bg-indigo-200/30 rounded-full flex items-center justify-center border-2 border-dashed border-indigo-300">
                                <ArrowUpRight size={32} className="text-indigo-400 group-hover:scale-125 transition-transform" />
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </section>
    );
};

export default Categories;
