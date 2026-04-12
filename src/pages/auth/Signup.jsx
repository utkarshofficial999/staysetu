import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, UserCircle, Briefcase, User } from 'lucide-react';
import GoogleButton from '../../components/auth/GoogleButton';

const Signup = () => {
    const navigate = useNavigate();
    const { user, profile, signInWithGoogle } = useAuth();
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If already logged in, redirect
    useEffect(() => {
        if (user && profile) {
            const r = profile.role || 'student';
            navigate((r === 'owner' || r === 'broker') ? '/owner-dashboard' : '/dashboard', { replace: true });
        }
    }, [user, profile, navigate]);

    const handleGoogleSignup = async () => {
        try {
            setLoading(true);
            setError(null);
            await signInWithGoogle(role);
        } catch (err) {
            setError('Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'student', label: 'Student', icon: UserCircle, desc: 'Looking for a place to stay' },
        { id: 'owner', label: 'Owner', icon: Briefcase, desc: 'List my property' },
        { id: 'broker', label: 'Broker', icon: User, desc: 'Manage multiple listings' },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-surface relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="card-elevated p-8 animate-slide-up">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-32 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5 p-2 bg-white shadow-sm border border-slate-100 overflow-hidden">
                            <img src="/logo.png?v=8" alt="StaySetu Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1.5" style={{ fontFamily: 'Bungee' }}>Join StaySetu</h1>
                        <p className="text-slate-500 text-sm font-normal">Choose your role and continue with Google</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 animate-fade-in">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Role Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-600 mb-3">I want to</label>
                        <div className="grid grid-cols-3 gap-2">
                            {roles.map(({ id, label, icon: Icon, desc }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setRole(id)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
                                        role === id
                                            ? 'border-blue-300 bg-blue-50 shadow-sm'
                                            : 'border-slate-200/60 hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className={role === id ? 'text-blue-900' : 'text-slate-400'} size={20} />
                                    <span className={`text-[10px] font-semibold mt-1.5 ${role === id ? 'text-blue-900 font-bold' : 'text-slate-600'}`}>
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                            {roles.find(r => r.id === role)?.desc}
                        </p>
                    </div>

                    <GoogleButton onClick={handleGoogleSignup} loading={loading} />

                    <p className="mt-6 text-center text-slate-400 text-xs">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>

                <p className="mt-8 text-center text-slate-500 font-normal text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-900 hover:text-blue-900 font-semibold">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
