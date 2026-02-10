import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { QRCodeSVG } from 'qrcode.react';

const Security = () => {
    const [loading, setLoading] = useState(false);
    const [factorId, setFactorId] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [message, setMessage] = useState('');
    const [isMFAEnabled, setIsMFAEnabled] = useState(false);

    useEffect(() => {
        checkMFAStatus();
    }, []);

    const checkMFAStatus = async () => {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) {
            console.error('Error fetching factors:', error);
            return;
        }
        const activeFactor = data.all.find(f => f.status === 'verified');
        if (activeFactor) {
            setIsMFAEnabled(true);
        }
    };

    const enrollMFA = async () => {
        setLoading(true);
        setMessage('');
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp'
            });

            if (error) throw error;

            setFactorId(data.id);
            setQrCode(data.totp.qr_code);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyMFA = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const { error } = await supabase.auth.mfa.challengeAndVerify({
                factorId: factorId,
                code: verifyCode
            });

            if (error) throw error;

            setIsMFAEnabled(true);
            setQrCode('');
            setMessage('2FA successfully enabled!');
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const unenrollMFA = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) return;

        setLoading(true);
        try {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const factor = factors.all.find(f => f.status === 'verified');

            if (factor) {
                const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
                if (error) throw error;
                setIsMFAEnabled(false);
                setMessage('2FA has been disabled.');
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-cyan-500/10 rounded-xl">
                        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Security Settings</h1>
                        <p className="text-slate-400">Protect your account with Two-Factor Authentication</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-2">Authenticator App</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Use an app like Google Authenticator or Authy to generate secure codes.
                            </p>

                            {!isMFAEnabled ? (
                                !qrCode ? (
                                    <button
                                        onClick={enrollMFA}
                                        disabled={loading}
                                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                                    >
                                        Enable 2FA
                                    </button>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="bg-white p-4 rounded-xl inline-block mx-auto">
                                            <QRCodeSVG value={qrCode} size={200} />
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-sm text-slate-300">
                                                1. Scan the QR code above with your authenticator app.<br />
                                                2. Enter the 6-digit code below to verify.
                                            </p>
                                            <form onSubmit={verifyMFA} className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={verifyCode}
                                                    onChange={(e) => setVerifyCode(e.target.value)}
                                                    placeholder="000 000"
                                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-center text-2xl tracking-widest focus:border-cyan-500 outline-none"
                                                    maxLength={6}
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all"
                                                >
                                                    {loading ? 'Verifying...' : 'Verify & Enable'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-green-400 bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-semibold">2FA is currently active</span>
                                    </div>
                                    <button
                                        onClick={unenrollMFA}
                                        disabled={loading}
                                        className="w-full bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-bold py-3 rounded-lg transition-all border border-slate-600 hover:border-red-500/50"
                                    >
                                        Disable 2FA
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">Why use 2FA?</h3>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li className="flex gap-3">
                                    <span className="text-cyan-400">✔</span>
                                    Prevents unauthorized access even if your password is stolen.
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-cyan-400">✔</span>
                                    Adds a second layer of physical security (your phone).
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-cyan-400">✔</span>
                                    Standard practice for professional data protection.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`mt-8 p-4 rounded-lg text-center border animate-in fade-in slide-in-from-bottom-2 ${message.includes('success') || message.includes('disabled') || message.includes('active')
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Security;
