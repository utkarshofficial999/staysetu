import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account, databases, DATABASE_ID, COLLECTION, ID } from '../../lib/appwrite';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, UserCircle, Briefcase, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

import GoogleButton from '../../components/auth/GoogleButton';

const Signup = () => {
    const navigate = useNavigate();
    const { user, profile, signInWithGoogle, checkUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // If already logged in, redirect
    useEffect(() => {
        if (user && profile) {
            const role = profile.role || 'student';
            navigate(role === 'owner' ? '/owner-dashboard' : '/dashboard', { replace: true });
        }
    }, [user, profile, navigate]);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create account
            await account.create(ID.unique(), email, password, fullName);

            // Log in immediately
            await account.createEmailPasswordSession(email, password);

            // Get user
            const authUser = await account.get();

            // Create profile document
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION.profiles,
                ID.unique(),
                {
                    userId: authUser.$id,
                    fullName: fullName,
                    email: email,
                    role: role,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            );

            // Refresh auth context
            await checkUser();

            setSuccess(true);
            setTimeout(() => {
                if (role === 'owner') {
                    navigate('/owner-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            // Pass the current selected role to the OAuth flow
            await signInWithGoogle(role);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="card-elevated p-8 animate-slide-up">
                    <div className="text-center mb-8">
                        <div className="w-32 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 p-2 bg-black/5 shadow-sm border border-slate-100">
                            <img src="/logo.png?v=4" alt="StaySetu Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1.5" style={{ fontFamily: 'Bungee' }}>Create account</h1>
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
                            <p className="text-sm text-emerald-600 font-medium">Account created! Redirecting...</p>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-3">I want to</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setRole('student')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${role === 'student' ? 'border-plum-300 bg-plum-50 shadow-sm' : 'border-slate-200/60 hover:border-slate-200 hover:bg-slate-50'}`}>
                                    <UserCircle className={role === 'student' ? 'text-plum-900 transition-colors' : 'text-slate-400'} size={24} />
                                    <span className={`text-sm font-semibold mt-2 ${role === 'student' ? 'text-plum-900 font-bold' : 'text-slate-600'}`}>Find a Stay</span>
                                </button>
                                <button type="button" onClick={() => setRole('owner')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${role === 'owner' ? 'border-plum-300 bg-plum-50 shadow-sm' : 'border-slate-200/60 hover:border-slate-200 hover:bg-slate-50'}`}>
                                    <Briefcase className={role === 'owner' ? 'text-plum-900 transition-colors' : 'text-slate-400'} size={24} />
                                    <span className={`text-sm font-semibold mt-2 ${role === 'owner' ? 'text-plum-900 font-bold' : 'text-slate-600'}`}>List Property</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="text" required className="input-field pl-10" placeholder="Your full name"
                                    value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="email" required className="input-field pl-10" placeholder="name@example.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="password" required minLength={8} className="input-field pl-10" placeholder="Min 8 characters"
                                    value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center group py-3.5 mt-2">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>Create Account<ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <span className="relative bg-white px-4 text-xs font-medium text-slate-400">or</span>
                        </div>
                        <GoogleButton onClick={handleGoogleLogin} loading={loading} />
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-500 font-normal text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-plum-900 hover:text-plum-900 font-semibold">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
