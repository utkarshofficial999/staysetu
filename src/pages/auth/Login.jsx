import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account, databases, DATABASE_ID, COLLECTION, Query } from '../../lib/appwrite';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

import GoogleButton from '../../components/auth/GoogleButton';

const Login = () => {
    const navigate = useNavigate();
    const { user, profile, signInWithGoogle, checkUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If already logged in, redirect
    useEffect(() => {
        if (user && profile) {
            const role = profile.role || 'student';
            navigate(role === 'owner' ? '/owner-dashboard' : '/dashboard', { replace: true });
        }
    }, [user, profile, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await account.createEmailPasswordSession(email, password);

            // Get user and profile
            const authUser = await account.get();
            const res = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION.profiles,
                [Query.equal('userId', authUser.$id)]
            );

            const role = res.documents[0]?.role || 'student';

            // Refresh auth context
            await checkUser();

            if (role === 'owner') {
                navigate('/owner-dashboard', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="card-elevated p-8 animate-slide-up">
                    <div className="text-center mb-8">
                        <div className="w-32 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 p-2 bg-black/5 shadow-sm border border-slate-100">
                            <img src="/logo.png?v=4" alt="StaySetu Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1.5" style={{ fontFamily: 'Bungee' }}>Welcome back</h1>
                        <p className="text-slate-500 text-sm font-normal">Log in to your StaySetu account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 animate-fade-in">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="email" required className="input-field pl-10" placeholder="name@example.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-slate-600">Password</label>
                                <a href="#" className="text-xs font-medium text-plum-900 hover:text-plum-900">Forgot?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="password" required className="input-field pl-10" placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center group py-3">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>Log In<ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-7">
                        <div className="relative flex items-center justify-center mb-5">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <span className="relative bg-white px-4 text-xs font-medium text-slate-400">or</span>
                        </div>
                        <GoogleButton onClick={handleGoogleLogin} loading={loading} />
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-500 font-normal text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-plum-900 hover:text-plum-900 font-semibold">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
