'use client';
import { motion } from 'framer-motion';
import { Zap, Target, Layers, Mic, Rocket, Globe } from 'lucide-react';
import Image from 'next/image';

const features = [
    {
        title: "The Context Vault",
        description: "Teach the AI your brand voice once. It remembers your tone, compliance rules, and audience for every single post.",
        icon: Mic,
        colSpan: "lg:col-span-2",
        bg: "bg-slate-900 text-white",
        image: "/assets/settings_view.png" // Dark mode feature
    },
    {
        title: "Keyword Clustering",
        description: "Don't just write posts. Dominate topics. We group keywords into semantic clusters for authority.",
        icon: Target,
        colSpan: "lg:col-span-1",
        bg: "bg-white border border-slate-200"
    },
    {
        title: "Multi-Project Architecture",
        description: "Running an agency? Manage unlimited distinct projects with isolated context and settings.",
        icon: Layers,
        colSpan: "lg:col-span-1",
        bg: "bg-white border border-slate-200"
    },
    {
        title: "Lightning Fast Drafts",
        description: "Go from 'Idea' to '2,000-word Draft' in under 45 seconds. Scale without burnout.",
        icon: Zap,
        colSpan: "lg:col-span-2",
        bg: "bg-indigo-50 border border-indigo-100"
    }
];

export function LandingFeatures() {
    return (
        <section id="features" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Everything you need to <br />
                        <span className="text-indigo-600">dominate the SERPs.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`${feature.colSpan} ${feature.bg} rounded-3xl p-8 relative overflow-hidden group`}
                        >
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6" />
                                </div>

                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-sm opacity-80 leading-relaxed mb-6">{feature.description}</p>

                                {feature.image && (
                                    <div className="flex-1 min-h-[200px] relative rounded-t-xl overflow-hidden mt-auto border border-white/10 shadow-2xl translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                                        <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            fill
                                            className="object-cover object-top"
                                        />
                                        {/* Overlay to blend image into card bottom */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                    </div>
                                )}
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 p-32 bg-current opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
