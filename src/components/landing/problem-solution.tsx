'use client';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import Image from 'next/image';

export function LandingProblemSolution() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Stop managing spreadsheets. <br />
                        Start managing <span className="text-indigo-600">strategy.</span>
                    </h2>
                    <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                        The old way of SEO is broken. Disconnected tools, expensive writers, and zero context.
                        The Blog OS unifies everything.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* The Old Way (Negative) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-red-500/5 rounded-2xl transform rotate-2 group-hover:rotate-1 transition-transform" />
                        <div className="relative bg-slate-50 p-8 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-6 text-red-600 font-semibold">
                                <span className="p-2 bg-red-100 rounded-lg"><X className="w-5 h-5" /></span>
                                The Old Way
                            </div>
                            <ul className="space-y-4 text-slate-600 mb-8">
                                <li className="flex items-start gap-3">
                                    <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                    <span>Messy Google Sheets with lost links</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                    <span>Expensive freelancers (approx $200/post)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                    <span>Inconsistent brand voice across posts</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                    <span>Generic, detectable AI content</span>
                                </li>
                            </ul>
                            {/* Blurred generic UI to represent chaos */}
                            <div className="h-40 bg-slate-200/50 rounded-lg w-full overflow-hidden relative grayscale opacity-60">
                                <div className="absolute inset-x-0 top-4 h-2 bg-slate-300 mx-4 rounded" />
                                <div className="absolute inset-x-0 top-10 h-2 bg-slate-300 mx-4 rounded w-2/3" />
                                <div className="absolute inset-x-0 top-16 h-2 bg-slate-300 mx-4 rounded w-3/4" />
                            </div>
                        </div>
                    </motion.div>

                    {/* The New Way (Positive) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl transform -rotate-1 group-hover:rotate-0 transition-transform" />
                        <div className="relative bg-white p-8 rounded-2xl border border-indigo-100 shadow-xl">
                            <div className="flex items-center gap-3 mb-6 text-indigo-600 font-semibold">
                                <span className="p-2 bg-indigo-100 rounded-lg"><Check className="w-5 h-5" /></span>
                                The Blog OS
                            </div>
                            <ul className="space-y-4 text-slate-700 mb-8 font-medium">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span>Centralised Planner & Kanban Board</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span>AI that knows your specific Brand Voice</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span>Automated SEO keyword clustering</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span>One-click Publish to WordPress/CMS</span>
                                </li>
                            </ul>

                            {/* Planner Screenshot Snippet */}
                            <div className="h-48 relative rounded-lg overflow-hidden border border-indigo-100 shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
                                <Image
                                    src="/assets/planner_workflow.png"
                                    alt="Planner View"
                                    fill
                                    className="object-cover object-left-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                                {/* Floating Badge */}
                                <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-indigo-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-semibold text-slate-800">Generating Posts...</span>
                                    </div>
                                    <span className="text-xs text-indigo-600 font-mono">3/3</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
