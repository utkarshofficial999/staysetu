import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import GoogleButton from '../../components/auth/GoogleButton';

const Login = () => {
    const navigate = useNavigate();
    const { user, profile, signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If already logged in, redirect
    useEffect(() => {
        if (user && profile) {
            const role = profile.role || 'student';
            navigate((role === 'owner' || role === 'broker') ? '/owner-dashboard' : '/dashboard', { replace: true });
        }
    }, [user, profile, navigate]);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            await signInWithGoogle();
        } catch (err) {
            setError('Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-surface relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="card-elevated p-10 animate-slide-up text-center">

                    {/* Logo */}
                    <div className="w-32 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 p-2 bg-white shadow-sm border border-slate-100 overflow-hidden">
                        <img src="/logo.png?v=8" alt="StaySetu Logo" className="w-full h-full object-contain" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Bungee' }}>Welcome back</h1>
                    <p className="text-slate-500 text-sm font-normal mb-8">Sign in to your StaySetu account</p>

                    {error && (
                        <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 animate-fade-in text-left">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <GoogleButton onClick={handleGoogleLogin} loading={loading} />

                    <p className="mt-8 text-center text-slate-400 text-xs">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>

                <p className="mt-8 text-center text-slate-500 font-normal text-sm">
                    New to StaySetu?{' '}
                    <Link to="/signup" className="text-blue-900 hover:text-blue-900 font-semibold">Create account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
