'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HeaderNotices } from "@/components/layout/header-notices";
import { ClientAccountMenu } from "@/components/layout/client-account-menu";
import { ProjectBanner } from "@/components/layout/project-banner";
import { GlobalGenerationLoader } from "@/components/global-generation-loader";

export function AppShell({
    children,
    status,
    isAppDomain
}: {
    children: React.ReactNode;
    status: { hasAccess: boolean; role?: string | null };
    isAppDomain: boolean;
}) {
    // If we are NOT on the tool domain, render FULL WIDTH marketing layout
    if (!isAppDomain) {
        return (
            <div className="min-h-screen bg-slate-50">
                {children}
                <GlobalGenerationLoader />
            </div>
        );
    }

    // Default App Layout (Sidebar + Main) - ONLY on tool domain
    if (status.hasAccess) {
        return (
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
        );
    }

    // Not Authorized / Access Screen
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-300">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}
