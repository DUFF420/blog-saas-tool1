'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function LandingHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });

    // Parallax & Fade for the dashboard image
    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    const toolUrl = process.env.NODE_ENV === 'production'
        ? 'https://tool.theblogos.com'
        : 'http://tool.localhost:3000';

    return (
        <section ref={containerRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>The AI Content Engine for Founders</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]"
                    >
                        Scale your <span className="text-indigo-600">company blog</span>. <br />
                        Recover your time.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto"
                    >
                        Turn your website into a 24/7 organic traffic machine. Plan, write, and publish
                        SEO-optimized articles that perfectly match your brand voice.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <a
                            href={`${toolUrl}/sign-up`}
                            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                        >
                            Get Early Access
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <Link
                            href="#features"
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center"
                        >
                            View Features
                        </Link>
                    </motion.div>
                </div>

                {/* 3D Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                    style={{ y, opacity, scale }}
                    className="relative mx-auto max-w-5xl"
                >
                    <div className="relative rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/10] group">
                        {/* Browser Chrome */}
                        <div className="h-8 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                        </div>
                        {/* Image */}
                        <div className="relative w-full h-full">
                            <Image
                                src="/assets/hero_v2.png"
                                alt="Dashboard Preview"
                                fill
                                className="object-cover object-top"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                quality={90}
                            />
                            {/* Overlay Gradient for Depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-50/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Floating Notifications (Animation) */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.5, duration: 0.5 }}
                            className="absolute top-20 right-8 bg-white p-4 rounded-lg shadow-xl border border-slate-100 flex items-center gap-3 z-20"
                        >
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <div className="text-sm font-medium text-slate-700">SEO Score: 98/100</div>
                        </motion.div>
                    </div>

                    {/* Shadow underneath */}
                    <div className="absolute -bottom-10 left-10 right-10 h-20 bg-indigo-500/20 blur-[60px] rounded-full z-[-1]" />
                </motion.div>
            </div>
        </section>
    );
}
