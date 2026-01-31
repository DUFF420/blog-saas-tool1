'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Network, ArrowRight, Database, Cpu, FileText, Image as ImageIcon, Sparkles, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export function TechStackVisualizer() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-slate-900 dark:text-indigo-400 dark:border-indigo-900">
                    <Network className="w-4 h-4" /> View System Architecture
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[80vh] overflow-y-auto bg-slate-950 text-slate-100 border-slate-800">
                <div className="flex flex-col items-center py-8 space-y-12">

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            The "Brain" Architecture
                        </h2>
                        <p className="text-slate-400 max-w-lg mx-auto">
                            How raw data and context allows the AI to "think" like your brand.
                        </p>
                    </div>

                    {/* Flow Chart Grid */}
                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4">

                        {/* Column 1: Inputs */}
                        <div className="space-y-6">
                            <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                                1. Context Injection
                            </div>

                            <Node
                                icon={Database}
                                title="Context Vault"
                                color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                                desc="Stores active Brand Voice, Business Goals, and Operational Realities."
                            />

                            <Node
                                icon={FileText}
                                title="Project Data"
                                color="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                desc="Domain info, Sitemap content, and SEO Keywords."
                            />

                            <Node
                                icon={Layers}
                                title="User Input"
                                color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                desc="Topic, Angle, and specific Intent for this single post."
                            />
                        </div>

                        {/* Arrows Column 1->2 */}
                        <div className="hidden md:flex flex-col justify-center items-center space-y-4 opacity-30">
                            <div className="h-full w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent absolute left-[33%] top-0 bottom-0" />
                            <ArrowRight className="w-6 h-6 text-slate-500 animate-pulse absolute left-[32%] top-[50%]" />
                        </div>

                        {/* Column 2: The Engine (Center) */}
                        <div className="space-y-6 relative">
                            <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                                2. Logic & Processing
                            </div>

                            <div className="p-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />
                                <div className="relative z-10 text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="p-3 bg-indigo-500/20 rounded-full ring-1 ring-indigo-400">
                                            <Cpu className="w-8 h-8 text-indigo-300" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Prompt Builder Engine</h3>
                                        <p className="text-indigo-200 text-xs mt-1">Class: <code>PromptBuilder.ts</code></p>
                                    </div>
                                    <p className="text-sm text-slate-300">
                                        Merges context + input into massive, structured System Prompts.
                                        Enforces "Universal Rules" (tables, FAQs) dynamically.
                                    </p>
                                </div>
                            </div>

                            <Node
                                icon={Sparkles}
                                title="AI Models"
                                color="bg-violet-500/10 text-violet-400 border-violet-500/20"
                                desc="GPT-4 Turbo (Text) + DALL-E 3 (Visuals)"
                            />
                        </div>

                        {/* Arrows Column 2->3 */}
                        <div className="hidden md:flex flex-col justify-center items-center space-y-4 opacity-30">
                            <div className="h-full w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent absolute right-[33%] top-0 bottom-0" />
                            <ArrowRight className="w-6 h-6 text-slate-500 animate-pulse absolute right-[32%] top-[50%]" />
                        </div>

                        {/* Column 3: Outputs */}
                        <div className="space-y-6">
                            <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                                3. Final Artifacts
                            </div>

                            <Node
                                icon={FileText}
                                title="Structured HTML"
                                color="bg-orange-500/10 text-orange-400 border-orange-500/20"
                                desc="SEO-optimized, semantic HTML blog post with injected internal links."
                            />

                            <Node
                                icon={ImageIcon}
                                title="Commercial Asset"
                                color="bg-pink-500/10 text-pink-400 border-pink-500/20"
                                desc="Context-aware 8K WebP image (Industrial setting enforced by logic)."
                            />
                        </div>

                    </div>

                    <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-center max-w-2xl text-sm text-slate-400">
                        <span className="text-indigo-400 font-semibold">Technical Note:</span> The system uses a "Chain of Thought" data flow. Data is not just passed; it is <strong>enriched</strong> at every step. The PromptBuilder doesn't just ask for a blog; it calculates the <em>audience + tone + constraints</em> to mathematically ensure quality.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Node({ icon: Icon, title, color, desc }: { icon: any, title: string, color: string, desc: string }) {
    return (
        <div className={`p-4 rounded-lg border ${color} bg-opacity-50 transition-all hover:scale-105 cursor-default`}>
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-md ${color.split(' ')[0]} bg-opacity-100`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-sm">{title}</h4>
                    <p className="text-xs opacity-70 mt-1 leading-relaxed">{desc}</p>
                </div>
            </div>
        </div>
    );
}
