'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function LandingNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                            <Image src="/logo.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-slate-900 tracking-tight">The Blog OS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/sign-in" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Sign In
                        </Link>
                        <Link
                            href="/sign-up"
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all hover:shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
