import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
    "Analyzing search intent...",
    "Building content structure...",
    "Writing comprehensive draft...",
    "Optimizing for SEO...",
    "Finalizing content..."
];

export function GenerationProgress({ isGenerating }: { isGenerating: boolean }) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!isGenerating) {
            setCurrentStep(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % steps.length);
        }, 3000); // Change step every 3 seconds

        return () => clearInterval(interval);
    }, [isGenerating]);

    if (!isGenerating) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 text-white rounded-lg shadow-2xl p-4 w-80 shadow-indigo-500/20">
                <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-sm rounded-full opacity-50 animate-pulse" />
                        <Loader2 className="h-5 w-5 text-indigo-400 animate-spin relative z-10" />
                    </div>
                    <h4 className="font-semibold text-sm">Generating Content AI Agent</h4>
                </div>

                <div className="space-y-3">
                    {steps.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;

                        // Only show current and previous one to keep it compact? Or show specific active one?
                        // Let's show current active step prominently
                        if (!isCurrent) return null;

                        return (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-sm text-slate-300"
                            >
                                <span className="text-indigo-400 text-xs font-mono">[{idx + 1}/{steps.length}]</span>
                                {step}
                            </motion.div>
                        );
                    })}
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-2">
                        <motion.div
                            className="h-full bg-indigo-500"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
