import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, UserCircle, Briefcase, Chrome, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                },
            });

            if (signupError) throw signupError;

            const user = data.user;

            if (user) {
                await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        full_name: fullName,
                        email: user.email,
                        role: role,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'id' });

                setSuccess(true);

                setTimeout(() => {
                    if (role === 'owner') {
                        navigate('/owner-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }, 1500);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) setError(error.message);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50 relative overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 bg-mesh pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="card-elevated p-8 animate-slide-up">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px -6px rgba(99,102,241,0.35)' }}>
                            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Space Grotesk' }}>S</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1.5" style={{ fontFamily: 'Space Grotesk' }}>Create account</h1>
                        <p className="text-slate-500 text-sm font-normal">Join StaySetu and find your perfect stay</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 animate-fade-in">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 animate-fade-in">
                            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-emerald-600 font-medium">
                                Account created! Redirecting to your {role === 'owner' ? 'Owner' : 'Student'} Dashboard...
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Role selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-3">I want to</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('student')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${role === 'student'
                                        ? 'border-indigo-300 bg-indigo-50'
                                        : 'border-slate-200/60 hover:border-slate-200 hover:bg-slate-50'
                                        }`}
                                    style={role === 'student' ? { boxShadow: '0 0 0 1px rgba(99,102,241,0.2)' } : {}}
                                >
                                    <UserCircle className={role === 'student' ? 'text-indigo-500' : 'text-slate-400'} size={24} />
                                    <span className={`text-sm font-semibold mt-2 ${role === 'student' ? 'text-indigo-600' : 'text-slate-600'}`}>
                                        Find a Stay
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">Student</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('owner')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${role === 'owner'
                                        ? 'border-violet-300 bg-violet-50'
                                        : 'border-slate-200/60 hover:border-slate-200 hover:bg-slate-50'
                                        }`}
                                    style={role === 'owner' ? { boxShadow: '0 0 0 1px rgba(139,92,246,0.2)' } : {}}
                                >
                                    <Briefcase className={role === 'owner' ? 'text-violet-500' : 'text-slate-400'} size={24} />
                                    <span className={`text-sm font-semibold mt-2 ${role === 'owner' ? 'text-violet-600' : 'text-slate-600'}`}>
                                        List Property
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">Owner</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    required
                                    className="input-field pl-10"
                                    placeholder="Your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="input-field pl-10"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center group py-3 rounded-2xl font-semibold text-white transition-all active:scale-[0.97] text-sm ${role === 'owner'
                                ? 'bg-gradient-to-r from-violet-500 to-purple-600'
                                : ''
                                }`}
                            style={role === 'student'
                                ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px -2px rgba(99,102,241,0.35)' }
                                : { boxShadow: '0 4px 14px -2px rgba(139,92,246,0.35)' }
                            }
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative flex items-center justify-center mb-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <span className="relative bg-white px-4 text-xs font-medium text-slate-400">or</span>
                        </div>
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full btn-secondary flex items-center justify-center space-x-3 py-3"
                        >
                            <Chrome size={16} />
                            <span className="text-sm">Continue with Google</span>
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-500 font-normal text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-500 hover:text-indigo-600 font-semibold">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
