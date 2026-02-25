import React from 'react';
import { Link } from 'react-router-dom';
import { User, Users, Building, Home, ArrowUpRight } from 'lucide-react';

const categories = [
    {
        name: 'Boys PG',
        icon: User,
        gradient: 'from-blue-500 to-indigo-600',
        description: 'Safe & verified PGs near colleges',
        type: 'PG',
        gender: 'male',
    },
    {
        name: 'Girls PG',
        icon: Users,
        gradient: 'from-pink-500 to-rose-600',
        description: 'Secure stays with women-only options',
        type: 'PG',
        gender: 'female',
    },
    {
        name: 'Flats',
        icon: Home,
        gradient: 'from-indigo-500 to-violet-600',
        description: 'Fully furnished flats for students',
        type: 'Flat',
    },
    {
        name: 'Hostels',
        icon: Building,
        gradient: 'from-violet-500 to-purple-600',
        description: 'Budget-friendly hostel rooms',
        type: 'Hostel',
    },
];

const Categories = () => {
    return (
        <section className="relative py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-14">
                    <div>
                        <span className="section-label mb-4 block w-fit">Explore</span>
                        <h2 className="section-title" style={{ fontFamily: 'Space Grotesk' }}>Find Your Stay</h2>
                        <p className="text-slate-500 font-normal mt-2 max-w-md">
                            Browse accommodation types that fit your lifestyle and budget.
                        </p>
                    </div>
                    <Link to="/listings" className="hidden md:flex items-center gap-1.5 text-indigo-500 font-semibold text-sm hover:text-indigo-600 transition-colors">
                        View All <ArrowUpRight size={15} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/listings?type=${cat.type}${cat.gender ? `&gender=${cat.gender}` : ''}`}
                            className="group card-elevated p-6 md:p-8 flex flex-col"
                        >
                            <div className={`bg-gradient-to-br ${cat.gradient} w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-500`}
                                style={{ boxShadow: '0 8px 20px -4px rgba(99,102,241,0.2)' }}>
                                <cat.icon size={24} />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1.5" style={{ fontFamily: 'Space Grotesk' }}>{cat.name}</h3>
                            <p className="text-slate-400 text-sm font-normal leading-relaxed flex-1">{cat.description}</p>
                            <div className="mt-5 flex items-center gap-1.5 text-indigo-500 font-medium text-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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
