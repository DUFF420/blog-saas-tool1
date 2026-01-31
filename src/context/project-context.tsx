'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '@/types';

type ProjectContextType = {
    projects: Project[];
    activeProject: Project | null;
    isLoading: boolean;
    refreshProjects: (projects: Project[]) => void;
    selectProject: (projectId: string) => void;
    reloadContext: () => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({
    children,
    initialProjects = []
}: {
    children: React.ReactNode;
    initialProjects?: Project[];
}) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load active project from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('activeProjectId');
        if (stored) setActiveProjectId(stored);
    }, []);

    const selectProject = (id: string) => {
        setActiveProjectId(id);
        localStorage.setItem('activeProjectId', id);
    };

    const refreshProjects = (newProjects: Project[]) => {
        setProjects(newProjects);
    };

    const activeProject = projects.find(p => p.id === activeProjectId) || null;

    const reloadContext = async () => {
        // In a real app, this would re-fetch from DB.
        // For now, we assume local state is updated by actions or we just re-sync.
        // If getting from server actions:
        try {
            setIsLoading(true);
            const { getAllProjects } = await import('@/actions/project');
            const data = await getAllProjects();
            setProjects(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProjectContext.Provider value={{ projects, activeProject, isLoading, refreshProjects, selectProject, reloadContext }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}
