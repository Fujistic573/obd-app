import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    const [showMFAScreen, setShowMFAScreen] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaChallengeId, setMfaChallengeId] = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/my-vehicles'
                }
            });
            if (error) throw error;
        } catch (error) {
            setMessage(error.message);
            setLoading(false);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();

        if (isSignUp) {
            if (password !== confirmPassword) {
                setMessage('Passwords do not match');
                return;
            }
            if (!fullName.trim()) {
                setMessage('Please enter your full name');
                return;
            }
            if (!acceptTerms) {
                setMessage('You must accept the Terms and Conditions');
                return;
            }
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone_number: phone,
                        }
                    }
                });
                if (error) throw error;
                setMessage('Success! Check your email for the confirmation link.');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                // Check if MFA is required
                const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
                if (factorsError) throw factorsError;

                const verifiedFactor = factors.all.find(f => f.status === 'verified');
                if (verifiedFactor) {
                    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
                        factorId: verifiedFactor.id
                    });
                    if (challengeError) throw challengeError;

                    setMfaChallengeId(challenge.id);
                    setShowMFAScreen(true);
                    return;
                }

                navigate('/my-vehicles');
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMFAVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const { error } = await supabase.auth.mfa.verify({
                factorId: (await supabase.auth.mfa.listFactors()).data.all.find(f => f.status === 'verified').id,
                challengeId: mfaChallengeId,
                code: mfaCode
            });

            if (error) throw error;
            navigate('/my-vehicles');
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                        OBD.ai
                    </h1>
                    <p className="text-slate-400">Join the future of vehicle diagnostics</p>
                </div>

                <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
                    <h2 className="text-2xl font-bold text-center text-white mb-6">
                        {showMFAScreen ? 'Verification Code' : (isSignUp ? 'Create Account' : 'Welcome Back')}
                    </h2>

                    {showMFAScreen ? (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="text-center space-y-2">
                                <p className="text-slate-300">Enter the 6-digit code from your authenticator app.</p>
                            </div>
                            <form onSubmit={handleMFAVerify} className="space-y-6">
                                <input
                                    type="text"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    placeholder="000 000"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-center text-3xl font-bold tracking-[0.5em] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                                {message && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                        {message}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMFAScreen(false);
                                        setMessage('');
                                    }}
                                    className="w-full text-slate-500 hover:text-slate-400 text-sm font-medium transition-colors"
                                >
                                    Cancel and try again
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full mb-6 flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </button>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-slate-800 text-slate-500 font-medium">Or continue with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleAuth} className="space-y-4">
                                {isSignUp && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                                placeholder="John Doe"
                                                required={isSignUp}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                                placeholder="+359 888 123 456"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                {isSignUp && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>

                                        <div className="flex items-start gap-3 mt-4">
                                            <input
                                                id="terms"
                                                type="checkbox"
                                                checked={acceptTerms}
                                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 transition-all cursor-pointer"
                                                required
                                            />
                                            <label htmlFor="terms" className="text-sm text-slate-400 cursor-pointer select-none">
                                                I agree to the <a href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms & Conditions</a> and <a href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
                                            </label>
                                        </div>
                                    </>
                                )}

                                {message && (
                                    <div className={`p-4 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300 ${message.toLowerCase().includes('success') || message.toLowerCase().includes('check')
                                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{message}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </span>
                                    ) : (
                                        isSignUp ? 'Create Account' : 'Sign In'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setMessage('');
                                    }}
                                    className="text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors"
                                >
                                    {isSignUp
                                        ? 'Already have an account? Sign in'
                                        : "Don't have an account? Create one"}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        <span className="inline-block mr-2">🔒</span>
                        Secure authentication powered by Supabase
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
