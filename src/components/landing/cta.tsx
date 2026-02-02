'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LandingCTA() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 via-white to-white pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                    Ready to build your <br />
                    organic growth engine?
                </h2>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                    Join the waitlist for The Blog OS and start scaling your content marketing with AI that actually understands your business.
                </p>

                <a
                    href={process.env.NODE_ENV === 'production' ? 'https://tool.theblogos.com/sign-up' : 'http://tool.localhost:3000/sign-up'}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                    Get Started for Free
                    <ArrowRight className="w-5 h-5" />
                </a>

                <p className="mt-6 text-sm text-slate-500">
                    No credit card required. Cancel anytime.
                </p>
            </div>
        </section>
    );
}
