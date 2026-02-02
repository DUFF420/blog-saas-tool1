import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "@/context/project-context";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getAllProjects } from "@/actions/project";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'sonner';
import { Project } from "@/types";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Blog OS by Luke Duff",
    description: "The ultimate AI blogging tool for SaaS founders.",
};

import { checkAccessStatus } from "@/actions/access";
import { AccessGuard } from "@/components/layout/access-guard";
import { ClientAccountMenu } from "@/components/layout/client-account-menu";

import { HeaderNotices } from "@/components/layout/header-notices";
import { ProjectBanner } from "@/components/layout/project-banner";
import { GenerationProvider } from "@/context/generation-context";
import { GlobalGenerationLoader } from "@/components/global-generation-loader";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let projects: Project[] = [];
    try {
        projects = await getAllProjects();
    } catch (error) {
        console.error("Failed to load projects for layout:", error);
    }
    const status = await checkAccessStatus();

    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning>
                <ClerkProvider>
                    <ProjectProvider initialProjects={projects}>
                        <AccessGuard hasAccess={status.hasAccess}>
                            <GenerationProvider>
                                {status.hasAccess ? (
                                    /* REGISTERED USERS */
                                    <div className="flex h-screen bg-slate-50 flex-col lg:flex-row">
                                        {/* Desktop Sidebar */}
                                        <div className="hidden lg:block">
                                            <Sidebar isAdmin={status.role === 'admin'} />
                                        </div>

                                        {/* Mobile Navigation */}
                                        <MobileNav isAdmin={status.role === 'admin'} />

                                        <main className="flex-1 overflow-auto bg-slate-50 relative">
                                            {/* Top Bar with Account Menu */}
                                            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 lg:px-8 lg:py-4 flex items-center justify-end gap-4">
                                                <HeaderNotices />
                                                <ClientAccountMenu />
                                            </div>
                                            {/* Project Banner */}
                                            <ProjectBanner />
                                            {/* Main Content */}
                                            <div className="p-4 lg:p-8">
                                                {children}
                                            </div>
                                        </main>
                                        <GlobalGenerationLoader />
                                    </div>
                                ) : (
                                    /* NOT AUTHORIZED (Needs Access Code or Banned) */
                                    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
                                        {/* Only show the actual route content if it's the access page or sign-in */}
                                        {/* This prevents the "refresh reveal" of background data */}
                                        <div className="w-full">
                                            {children}
                                        </div>
                                    </div>
                                )}
                            </GenerationProvider>
                        </AccessGuard>
                        <Toaster />
                    </ProjectProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
