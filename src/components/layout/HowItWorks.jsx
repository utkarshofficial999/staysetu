import React from 'react';
import { UserPlus, Search, MessageSquare, Home } from 'lucide-react';

const steps = [
    {
        title: 'Create Account',
        description: 'Sign up as a student to find stays, or as an owner to list your property.',
        icon: UserPlus,
        gradient: 'from-plum-800 to-plum-900',
    },
    {
        title: 'Browse & Filter',
        description: 'Use smart filters to find PGs or flats that match your preferences.',
        icon: Search,
        gradient: 'from-plum-700 to-plum-800',
    },
    {
        title: 'Connect & Chat',
        description: 'Message owners directly on the platform or connect via WhatsApp.',
        icon: MessageSquare,
        gradient: 'from-plum-600 to-plum-700',
    },
    {
        title: 'Move In',
        description: 'Finalize the details, visit the stay, and move into your new home.',
        icon: Home,
        gradient: 'from-plum-500 to-plum-600',
    },
];

const HowItWorks = () => {
    return (
        <section className="py-16 bg-[#0c0a0c] relative overflow-hidden">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="section-label mb-4 inline-block">How It Works</span>
                    <h2 className="section-title text-white" style={{ fontFamily: 'Space Grotesk' }}>
                        Find your stay in 4 simple steps
                    </h2>
                    <p className="text-slate-400 font-normal text-base mt-3">
                        Your journey to better living starts here.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 relative">
                    {/* Connector Line */}
                    <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex flex-col items-center text-center group">
                            {/* Step number + icon */}
                            <div className="relative mb-8">
                                <div className={`bg-white/10 border-2 border-white/40 w-[72px] h-[72px] rounded-[22px] flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-[0_0_25px_rgba(255,255,255,0.2)]`}>
                                    <step.icon size={30} strokeWidth={1.8} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#141114] rounded-full flex items-center justify-center border border-white/10 text-xs font-bold text-white shadow-xl">
                                    {index + 1}
                                </div>
                            </div>

                            {/* Card */}
                            <div className="card-elevated p-8 flex-1 w-full hover:!bg-white/[0.08] !bg-white/5">
                                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-normal">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
