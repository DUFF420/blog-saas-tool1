import { LandingHero } from "@/components/landing/hero";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFeatures } from "@/components/landing/features";
import { LandingProblemSolution } from "@/components/landing/problem-solution";
import { LandingPipeline } from "@/components/landing/pipeline";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            <LandingNavbar />
            <main>
                <LandingHero />
                <LandingProblemSolution />
                <LandingFeatures />
                <LandingPipeline />
                <LandingCTA />
            </main>
            <LandingFooter />
        </div>
    );
}
