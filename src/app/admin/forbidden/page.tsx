import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function ForbiddenPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="p-12 text-center">
                    <div className="mx-auto bg-red-100/50 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                        <ShieldAlert className="text-red-500 w-12 h-12" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
                    <p className="text-slate-500 mb-8 text-lg">
                        You do not have permission to view this page. <br />
                        This area is restricted to administrators only.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to Dashboard
                    </Link>
                </div>
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                        System Security • Event Logged
                    </p>
                </div>
            </div>
        </div>
    );
}
