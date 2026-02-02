'use client';

import { ProjectProvider } from "@/context/project-context";
import { GenerationProvider } from "@/context/generation-context";
import { AccessGuard } from "@/components/layout/access-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from 'sonner';
import { Project } from "@/types";

interface RootProvidersProps {
    children: React.ReactNode;
    projects: Project[];
    status: { hasAccess: boolean; role?: string };
    isAppDomain: boolean;
}

export function RootProviders({
    children,
    projects,
    status,
    isAppDomain
}: RootProvidersProps) {
    return (
        <ProjectProvider initialProjects={projects}>
            <AccessGuard hasAccess={status.hasAccess}>
                <GenerationProvider>
                    <AppShell status={status} isAppDomain={isAppDomain}>
                        {children}
                    </AppShell>
                </GenerationProvider>
            </AccessGuard>
            <Toaster />
        </ProjectProvider>
    );
}
