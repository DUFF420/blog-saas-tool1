import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Loader2, Sparkles, CheckCircle2, FileText, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BlogPost } from "@/types";

interface GenerationProgressProps {
    isGenerating: boolean;
    generatingPosts?: BlogPost[]; // Pass actual generating posts
    generatingCount?: number; // Optional override for count if posts not available
}

export function GenerationProgress({ isGenerating, generatingPosts = [], generatingCount }: GenerationProgressProps) {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);

    // 🔥 FIX: Persist start time across renders to prevent progress reset
    const startTimeRef = useRef<number | null>(null);

    const activeCount = generatingCount !== undefined ? generatingCount : generatingPosts.length;

    const steps = [
        { label: "Analyzing Context & Keywords...", icon: Search, time: 10 },
        { label: "Drafting Content Structure...", icon: FileText, time: 25 },
        { label: "Optimizing SEO & Tone...", icon: Sparkles, time: 35 },
        { label: "Final Polish...", icon: CheckCircle2, time: 45 },
    ];

    useEffect(() => {
        if (!isGenerating) {
            setProgress(0);
            setStep(0);
            startTimeRef.current = null; // Reset on completion
            return;
        }

        // 🔥 FIX: Only set start time ONCE when generation begins
        if (startTimeRef.current === null) {
            const firstGenerating = generatingPosts.length > 0 ? generatingPosts[0] : null;
            startTimeRef.current = firstGenerating?.updatedAt
                ? new Date(firstGenerating.updatedAt).getTime()
                : Date.now();
        }

        const updateProgress = () => {
            const now = Date.now();
            const elapsed = (now - startTimeRef.current!) / 1000; // seconds
            const expectedDuration = 45; // ~45 seconds average generation time

            // Calculate actual progress percentage
            const calculatedProgress = Math.min((elapsed / expectedDuration) * 100, 99);
            setProgress(calculatedProgress);
        };

        // Initial calculation
        updateProgress();

        // Update every 500ms for smoother animation
        const interval = setInterval(updateProgress, 500);

        return () => clearInterval(interval);
    }, [isGenerating, generatingPosts]);

    // Calculate current step based on progress
    useEffect(() => {
        if (!isGenerating) return;
        if (progress < 22) setStep(0);
        else if (progress < 55) setStep(1);
        else if (progress < 77) setStep(2);
        else setStep(3);
    }, [progress, isGenerating]);

    if (!isGenerating) return null;

    const CurrentIcon = steps[step].icon;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <Card className="p-4 border-indigo-100 shadow-xl bg-white/95 backdrop-blur border-l-4 border-l-indigo-600">
                <div className="flex items-start gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-indigo-50 p-2 rounded-full">
                            <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-sm text-slate-800">
                            Generating Content {activeCount > 1 && `(${activeCount})`}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium h-5">
                            <CurrentIcon className="h-3 w-3" />
                            <span key={step} className="animate-in fade-in slide-in-from-left-2 duration-300">
                                {steps[step].label}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                            <motion.div
                                className="h-full bg-indigo-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "tween", ease: "linear", duration: 0.5 }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            {Math.round(progress)}% • Avg. 45-60 seconds
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
