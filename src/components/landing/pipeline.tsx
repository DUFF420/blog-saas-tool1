'use client';
import { motion } from 'framer-motion';

export function LandingPipeline() {
    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                        Your entire editorial team. <br />
                        Automated.
                    </h2>
                </div>

                {/* The Pipeline Visualization */}
                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="h-full bg-indigo-500 origin-left"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Step 1: Idea */}
                        <PipelineStep
                            idx={0}
                            title="Idea Capture"
                            desc="Add topic concepts or keywords directly to the planner."
                            status="Idea"
                        />
                        {/* Step 2: Generation */}
                        <PipelineStep
                            idx={1}
                            title="AI Draft"
                            desc="The OS generates a comprehensive draft using your context."
                            status="Drafting"
                        />
                        {/* Step 3: SEO Check */}
                        <PipelineStep
                            idx={2}
                            title="SEO Optimization"
                            desc="Automatic keyword insertion and header structure checks."
                            status="Optimizing"
                        />
                        {/* Step 4: Publish */}
                        <PipelineStep
                            idx={3}
                            title="Publish"
                            desc="One-click push to your CMS with formatting intact."
                            status="Live"
                            isLast
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function PipelineStep({ idx, title, desc, status, isLast = false }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.3 }}
            className="relative z-10 flex flex-col items-center text-center p-6"
        >
            {/* Node Circle */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-xl ring-4 ring-slate-900 ${isLast ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
                <span className="font-bold text-lg">{idx + 1}</span>
            </div>

            <div className={`text-xs font-mono py-1 px-3 rounded-full mb-4 ${isLast ? 'bg-green-500/20 text-green-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                {status}
            </div>

            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    );
}
