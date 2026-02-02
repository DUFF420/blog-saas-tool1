'use client';

import { useGeneration } from "@/context/generation-context";
import { GenerationProgress } from "@/components/planner/generation-progress";

export function GlobalGenerationLoader() {
    const { isGenerating, generatingIds } = useGeneration();

    // We only pass the boolean, as the detailed list of *which* posts are generating 
    // is internal to the context now (generatingIds). 
    // However, GenerationProgress expects `generatingPosts` (array). 
    // We can update GenerationProgress to be simpler or pass dummy array if it only needs count/existence.

    // Let's check GenerationProgress implementation. 
    // It iterates generatingPosts to show "Analysis..." vs "Writing...". 
    // Since we only track IDs globally currently, we might lose the "text status" detail unless we fetch it.
    // Ideally, we just show "Generating Content..." generic message globally.

    // For now, let's pass a dummy check or update GenerationProgress.
    // I'll update GenerationProgress to be more flexible.

    return (
        <GenerationProgress
            isGenerating={isGenerating}
            generatingPosts={[]} // Empty array, we'll update the component to handle this gracefully
            generatingCount={generatingIds.size}
        />
    );
}
