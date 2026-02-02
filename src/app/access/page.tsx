'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAccessCode, checkAccessStatus } from '@/actions/access';
import { toast } from 'sonner';
import { ShieldCheck, LockKeyhole, ShieldAlert } from 'lucide-react';

export default function AccessPage() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBanned, setIsBanned] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            const status = await checkAccessStatus();
            if (status.isBanned) {
                setIsBanned(true);
            }
        };
        checkStatus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const errorDiv = document.getElementById('access-error');
        if (errorDiv) errorDiv.innerText = '';

        try {
            const result = await verifyAccessCode(code);

            if (result.success) {
                toast.success("Access Granted! Redirecting...");
                // Hard redirect to force server-side revalidation
                window.location.href = '/';
            } else {
                // Check specifically for suspension message
                if (result.error?.includes("Suspended")) {
                    setIsBanned(true); // Switch UI to banned mode immediately
                } else {
                    toast.error(result.error);
                }

                if (errorDiv) errorDiv.innerText = result.error || "Unknown Error";
                setLoading(false);
            }
        } catch (error) {
            toast.error("Something went wrong");
            setLoading(false);
        }
    };

    if (isBanned) {
        return (
            <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-slate-950">
                <div className="w-full max-w-md bg-red-950/20 rounded-2xl shadow-xl overflow-hidden border border-red-900/50 backdrop-blur-sm">
                    <div className="p-8 text-center">
                        <div className="mx-auto bg-red-900/20 ring-1 ring-red-500/50 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-lg shadow-red-900/20 animate-pulse">
                            <ShieldAlert className="text-red-500 w-10 h-10" />
                        </div>

                        <h1 className="text-2xl font-bold text-red-500 mb-2">Account Consultant Required</h1>
                        <p className="text-red-200/80 mb-8 text-sm leading-relaxed">
                            Your account access has been temporarily restricted due to policy considerations.
                            <br /><br />
                            Please contact our administration team for review:
                        </p>

                        <div className="bg-red-950/50 border border-red-900/30 rounded-lg p-4 mb-6">
                            <p className="text-red-400 font-mono text-sm select-all cursor-pointer hover:text-red-300 transition-colors" onClick={() => { toast.success("Copied email"); navigator.clipboard.writeText("lukeduff00@gmail.com") }}>
                                lukeduff00@gmail.com
                            </p>
                        </div>

                        <div className="text-center">
                            <a href="/sign-in" className="text-xs text-red-400/50 hover:text-red-400 transition-colors uppercase tracking-widest font-semibold">
                                Sign Out
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
                <div className="p-8 text-center">
                    <div className="mx-auto bg-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20">
                        <LockKeyhole className="text-white w-8 h-8" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">Early Access Required</h1>
                    <p className="text-slate-400 mb-8 text-sm">
                        This platform is currently in <span className="text-blue-400 font-medium">Private Beta</span>.<br />
                        Please enter your invitation code to unlock the full SaaS experience.
                    </p>

                    {/* INLINE ERROR DISPLAY */}
                    <div id="access-error" className="text-red-500 text-sm font-semibold mb-4 min-h-[20px]"></div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Ex: VIP-2026"
                                className="w-full text-center text-3xl font-mono tracking-[0.5em] font-bold bg-slate-950/50 border-2 border-slate-800 rounded-xl py-6 px-4 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-800 text-white shadow-inner uppercase"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            {loading ? 'Verifying...' : (
                                <>
                                    <ShieldCheck className="w-6 h-6" />
                                    Unlock Access
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                                Secure • Private • Encrypted
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
