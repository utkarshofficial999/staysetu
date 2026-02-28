import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
    const [openId, setOpenId] = React.useState(null);

    const toggleDesc = (e, id) => {
        // If it's a link to a page, we might want to prevent navigation if we just want the desc
        // But usually users want to see the desc. Let's make it toggle on click.
        e.preventDefault();
        setOpenId(openId === id ? null : id);
    };

    return (
        <footer className="relative z-10 bg-white text-slate-600 pt-20 pb-8 overflow-hidden border-t border-slate-100">
            {/* Subtle gradient accent at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plum-400/30 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="col-span-1 lg:col-span-1">
                        <Link to="/" className="flex items-center mb-6 group">
                            <div className="w-36 h-16 flex items-center justify-center rounded-xl overflow-hidden group-hover:rotate-1 transition-transform">
                                <img src="/logo.png?v=6" alt="StaySetu Logo" className="w-full h-full object-contain" />
                            </div>
                        </Link>
                        <p className="text-slate-500 mb-8 leading-relaxed text-sm font-normal">
                            Your bridge to better living. We connect students with safe, verified, and affordable housing options.
                        </p>
                        <div className="flex space-x-3">
                            <a
                                href="https://www.instagram.com/sudhanshu.pandey_/?igsh=MWEwZ3NqcDdoc2FuNQ%3D%3D"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-plum-900 hover:bg-slate-100 transition-all duration-300 border border-slate-100"
                            >
                                <Instagram size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="text-slate-900 font-semibold text-sm mb-6" style={{ fontFamily: 'Bungee' }}>Explore</h3>
                        <ul className="space-y-4">
                            {[
                                { id: 'e1', label: 'Boys PG', to: '/listings?type=PG&gender=male', desc: 'Secure and safe stays for students.' },
                                { id: 'e2', label: 'Girls PG', to: '/listings?type=PG&gender=female', desc: 'Vetted and verified girls only spaces.' },
                                { id: 'e3', label: 'Flats', to: '/listings?type=Flat', desc: 'Independent 1/2/3 BHK student flats.' },
                                { id: 'e4', label: 'Hostels', to: '/listings?type=Hostel', desc: 'Premium hostel with mess facilities.' },
                                { id: 'e5', label: 'List Property', to: '/signup', desc: 'Earn by listing your vacant property.' },
                            ].map((link) => (
                                <li key={link.label} className="group">
                                    <button onClick={(e) => toggleDesc(e, link.id)} className="block w-full text-left focus:outline-none">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-plum-900 transition-colors">
                                                {link.label}
                                            </span>
                                            <div className={`transition-transform duration-300 ${openId === link.id ? 'rotate-90' : ''}`}>
                                                <ArrowUpRight size={10} className="text-slate-300" />
                                            </div>
                                        </div>
                                        <div className={`overflow-hidden transition-all duration-300 ${openId === link.id ? 'max-h-20 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                                {link.desc}
                                            </p>
                                            <Link to={link.to} className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-plum-600 hover:underline">
                                                Go to Page →
                                            </Link>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-slate-900 font-semibold text-sm mb-6" style={{ fontFamily: 'Bungee' }}>Support</h3>
                        <ul className="space-y-4">
                            {[
                                { id: 's1', label: 'How it Works', desc: 'A quick guide on finding your perfect stay.' },
                                { id: 's2', label: 'About Us', desc: 'Our mission to bridge the student housing gap.' },
                                { id: 's3', label: 'Contact', desc: 'Get in touch for support or partnership.' },
                                { id: 's4', label: 'Terms of Service', desc: 'The rules and guidelines for our community.' },
                                { id: 's5', label: 'Privacy Policy', desc: 'How we keep your data safe and secure.' }
                            ].map((item) => (
                                <li key={item.label} className="group">
                                    <button onClick={(e) => toggleDesc(e, item.id)} className="block w-full text-left focus:outline-none">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-plum-900 transition-colors">
                                            {item.label}
                                        </span>
                                        <div className={`overflow-hidden transition-all duration-300 ${openId === item.id ? 'max-h-20 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-slate-900 font-semibold text-sm mb-6" style={{ fontFamily: 'Bungee' }}>Get in Touch</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                                    <Mail size={14} className="text-plum-600" />
                                </div>
                                <span className="text-slate-600">sudhanshupandey7393@gmail.com</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                                    <Phone size={14} className="text-plum-600" />
                                </div>
                                <span className="text-slate-600">+91 7393 011 350</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border border-slate-100">
                                    <MapPin size={14} className="text-plum-600" />
                                </div>
                                <span className="text-slate-600">ABES Engineering College, Ghaziabad</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                                    <Youtube size={14} className="text-red-500" />
                                </div>
                                <a href="https://youtube.com/@Sudhanshu_vision" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-red-500 font-medium transition-colors">
                                    @Sudhanshu_vision
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-600 font-normal">
                        © {new Date().getFullYear()} StaySetu. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-sm text-slate-600 font-normal">
                        <a href="#" className="hover:text-slate-400 transition-colors">Safety</a>
                        <a href="#" className="hover:text-slate-400 transition-colors">Trust</a>
                        <a href="#" className="hover:text-slate-400 transition-colors">Feedback</a>
                    </div>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
