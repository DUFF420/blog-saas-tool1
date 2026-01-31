import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "@/context/project-context";
import { Sidebar } from "@/components/layout/sidebar";
import { getAllProjects } from "@/actions/project";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Blog OS by Luke Duff",
    description: "Multi-Project SEO Blog Operating System",
};

import { checkAccessStatus } from "@/actions/access";
import { AccessGuard } from "@/components/layout/access-guard";
import { AccountMenu } from "@/components/layout/account-menu";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const projects = await getAllProjects();
    const status = await checkAccessStatus();

    return (
        <html lang="en">
            <body className={inter.className}>
                <ClerkProvider>
                    <ProjectProvider initialProjects={projects}>
                        {/* GLOBAL ACCESS GATE - Wraps everything */}
                        <AccessGuard hasAccess={status.hasAccess}>
                            {status.hasAccess ? (
                                /* REGISTERED USERS */
                                <div className="flex h-screen bg-slate-50">
                                    <Sidebar isAdmin={status.role === 'admin'} />
                                    <main className="flex-1 overflow-auto bg-slate-50">
                                        {/* Top Bar with Account Menu */}
                                        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4">
                                            <div className="flex items-center justify-end">
                                                <AccountMenu />
                                            </div>
                                        </div>
                                        {/* Main Content */}
                                        <div className="p-8">
                                            {children}
                                        </div>
                                    </main>
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
                        </AccessGuard>
                        <Toaster />
                    </ProjectProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
