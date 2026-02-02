'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useProject } from '@/context/project-context';
import { getGeneratingPostsAction } from '@/actions/planner';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

type GenerationContextType = {
    generatingIds: Set<string>;
    startGeneration: (id: string) => void;
    isGenerating: boolean;
};

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export function GenerationProvider({ children }: { children: React.ReactNode }) {
    const { activeProject } = useProject();
    const { getToken } = useAuth();
    const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

    const localStartsRef = useRef<Map<string, number>>(new Map());

    // Initial load and polling
    useEffect(() => {
        if (!activeProject) return;

        const checkStatus = async () => {
            const result = await getGeneratingPostsAction(activeProject.id);
            if (result.success && result.data) {
                if (result.data.length > 0) {
                    console.log(`[Generation] Server reports generating: ${result.data.join(', ')}`);
                }
                setGeneratingIds(prev => {
                    const serverSet = new Set(result.data);
                    const now = Date.now();
                    const merged = new Set(serverSet);

                    // Add locally started items that are "young" (e.g., < 15 seconds)
                    // This covers the race condition window where server hasn't updated yet.
                    localStartsRef.current.forEach((timestamp, id) => {
                        if (now - timestamp < 15000) {
                            merged.add(id);
                        } else {
                            // Expire old local starts to prevent ghosts
                            if (!serverSet.has(id)) {
                                localStartsRef.current.delete(id);
                            }
                        }
                    });

                    return merged;
                });
            }
        };

        // Check on mount
        checkStatus();

        // Stable polling interval (3s)
        // We don't use generatingIds.size as dependency to avoid race conditions (immediate re-check on start).
        const interval = setInterval(checkStatus, 3000);

        return () => clearInterval(interval);
    }, [activeProject]);

    // OPTIONAL: Subscription for faster response
    useEffect(() => {
        if (!activeProject || !getToken) return;
        // Note: We can add supabase subscription here similar to PlannerView
        // to catch 'UPDATE' events on posts table where status changes.
        // For now, polling is simpler and robust enough for "loading bar" feedback.
    }, [activeProject, getToken]);

    const startGeneration = (id: string) => {
        console.log(`[Generation] Starting local tracking for ${id}`);
        localStartsRef.current.set(id, Date.now());
        setGeneratingIds(prev => new Set(prev).add(id));
    };

    const isGenerating = generatingIds.size > 0;

    return (
        <GenerationContext.Provider value={{ generatingIds, startGeneration, isGenerating }}>
            {children}
        </GenerationContext.Provider>
    );
}

export function useGeneration() {
    const context = useContext(GenerationContext);
    if (context === undefined) {
        throw new Error('useGeneration must be used within a GenerationProvider');
    }
    return context;
}
