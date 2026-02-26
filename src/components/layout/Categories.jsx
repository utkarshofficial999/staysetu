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
        <section className="relative py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="section-label mb-4 block w-fit">Explore</span>
                        <h2 className="section-title text-slate-900" style={{ fontFamily: 'Bungee' }}>Find Your Stay</h2>
                        <p className="text-slate-500 font-normal mt-3 max-w-md">
                            Browse accommodation types that fit your lifestyle and budget.
                        </p>
                    </div>
                    <Link to="/listings" className="hidden md:flex items-center gap-1.5 text-slate-500 font-bold text-sm hover:text-plum-900 transition-all uppercase tracking-widest">
                        View All <ArrowUpRight size={15} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/listings?type=${cat.type}${cat.gender ? `&gender=${cat.gender}` : ''}`}
                            className="group card-elevated p-8 flex flex-col !bg-white hover:!bg-slate-50"
                        >
                            <div className="bg-slate-50 border border-slate-200 w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900 mb-7 group-hover:scale-110 transition-transform duration-500 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                                <cat.icon size={26} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Bungee' }}>{cat.name}</h3>
                            <p className="text-slate-500 text-sm font-normal leading-relaxed flex-1">{cat.description}</p>
                            <div className="mt-6 flex items-center gap-2 text-plum-900 font-bold text-[11px] uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                Browse <ArrowUpRight size={14} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;
