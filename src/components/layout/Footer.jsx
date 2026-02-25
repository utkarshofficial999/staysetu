import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative z-10 bg-slate-950 text-slate-400 pt-20 pb-8 overflow-hidden">
            {/* Subtle gradient accent at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-plum-400/30 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="col-span-1 lg:col-span-1">
                        <Link to="/" className="flex items-center space-x-2.5 mb-6 group">
                            <div className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                                style={{ background: 'linear-gradient(135deg, #3A1F3D, #524058)' }}>
                                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>S</span>
                            </div>
                            <span className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>StaySetu</span>
                        </Link>
                        <p className="text-slate-500 mb-8 leading-relaxed text-sm font-normal">
                            Your bridge to better living. We connect students with safe, verified, and affordable housing options.
                        </p>
                        <div className="flex space-x-3">
                            {[Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 bg-slate-800/60 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-plum-800 transition-all duration-300">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-6" style={{ fontFamily: 'Space Grotesk' }}>Explore</h3>
                        <ul className="space-y-3.5">
                            {[
                                { label: 'Boys PG', to: '/listings?type=PG&gender=male' },
                                { label: 'Girls PG', to: '/listings?type=PG&gender=female' },
                                { label: 'Flats', to: '/listings?type=Flat' },
                                { label: 'Hostels', to: '/listings?type=Hostel' },
                                { label: 'List Property', to: '/signup' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link to={link.to} className="text-sm font-normal text-slate-500 hover:text-white transition-colors flex items-center gap-1 group">
                                        {link.label}
                                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-6" style={{ fontFamily: 'Space Grotesk' }}>Support</h3>
                        <ul className="space-y-3.5">
                            {['How it Works', 'About Us', 'Contact', 'Terms of Service', 'Privacy Policy'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-sm font-normal text-slate-500 hover:text-white transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-6" style={{ fontFamily: 'Space Grotesk' }}>Get in Touch</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 bg-slate-800/60 rounded-lg flex items-center justify-center shrink-0">
                                    <Mail size={14} className="text-plum-400" />
                                </div>
                                <span>support@staysetu.com</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm">
                                <div className="w-8 h-8 bg-slate-800/60 rounded-lg flex items-center justify-center shrink-0">
                                    <Phone size={14} className="text-plum-400" />
                                </div>
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-start space-x-3 text-sm">
                                <div className="w-8 h-8 bg-slate-800/60 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin size={14} className="text-plum-400" />
                                </div>
                                <span>Knowledge Park, Greater Noida, UP</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
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
        </footer>
    );
};

export default Footer;
