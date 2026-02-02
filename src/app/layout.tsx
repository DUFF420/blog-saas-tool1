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
import { AppShell } from "@/components/layout/app-shell";
import { headers } from "next/headers";

import { RootProviders } from "@/components/providers/root-providers";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const isAppDomain = host.startsWith('tool.') || host.includes('tool');

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
                    <RootProviders
                        projects={projects}
                        status={status}
                        isAppDomain={isAppDomain}
                    >
                        {children}
                    </RootProviders>
                </ClerkProvider>
            </body>
        </html>
    );
}
