import { SignIn } from "@clerk/nextjs";
import { ClearSession } from "@/components/auth/clear-session";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            <ClearSession />

            {/* Left Side - Branding & Animation */}
            <div className="hidden lg:flex relative flex-col justify-between p-12 bg-slate-950 text-white overflow-hidden isolate">
                {/* Animated Background Layers */}
                <div className="absolute inset-0 z-[-1]">
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                    <div className="absolute top-[-50%] left-[-50%] right-[-50%] bottom-[-50%] bg-gradient-to-br from-indigo-900/40 via-slate-950 to-blue-900/40 animate-slow-spin opacity-70 blur-3xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20"></div>
                </div>

                {/* Logo Area */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-lg">
                        <Image src="/logo.png" alt="Blog OS Logo" fill className="object-cover" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">The Blog OS</span>
                </div>

                {/* Hero Text */}
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold tracking-tight mb-4 text-white leading-tight">
                        Scale your content <br />
                        <span className="text-indigo-400">at the speed of AI.</span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        The complete operating system for SaaS founders to build, manage, and dominate their SEO strategy.
                    </p>
                </div>

                {/* Footer / Credit */}
                <div className="relative z-10 text-sm text-slate-500 font-medium">
                    <p>
                        Designed & Built by{" "}
                        <a
                            href="https://lukeduff.co.uk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-indigo-400 transition-colors underline decoration-slate-700 underline-offset-4 hover:decoration-indigo-400"
                        >
                            Luke Duff
                        </a>
                    </p>
                </div>
            </div>

            {/* Mobile Header (Visible only on small screens) */}
            <div className="lg:hidden absolute top-0 left-0 w-full p-6 flex items-center gap-2 z-20 bg-white/50 backdrop-blur-sm">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                    <Image src="/logo.png" alt="Blog OS Logo" fill className="object-cover" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">The Blog OS</span>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-6 lg:p-24 bg-white min-h-screen lg:h-full relative">
                <div className="w-full max-w-[440px] space-y-10 pt-20 lg:pt-0">

                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                cardBox: "w-full shadow-none border-none",
                                card: "shadow-none border-none w-full",
                                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 h-11 text-[15px] normal-case transition-all shadow-md hover:shadow-lg",
                                footerActionLink: "text-indigo-600 hover:text-indigo-700 font-medium",
                                headerTitle: "text-2xl font-bold text-slate-900 tracking-tight",
                                headerSubtitle: "text-slate-500 text-[15px] mt-2",
                                socialButtonsBlockButton: "h-11 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors",
                                formFieldLabel: "text-slate-700 font-medium mb-1.5",
                                formFieldInput: "h-11 border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all rounded-lg text-[15px]",
                                dividerLine: "bg-slate-200",
                                dividerText: "text-slate-400 font-medium"
                            },
                            layout: {
                                socialButtonsPlacement: "top",
                                socialButtonsVariant: "blockButton"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
