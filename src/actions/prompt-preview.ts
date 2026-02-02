'use server';

import { getContext } from '@/actions/project';
import { PromptBuilder } from '@/lib/generation/prompt-builder';
import { createDefaultContext } from '@/lib/defaults';
import { auth } from "@clerk/nextjs/server";
import { isSuperAdmin } from '@/lib/permissions';

/**
 * Admin-only prompt preview
 * Allows debugging of the exact prompts sent to OpenAI
 */
export async function getPromptPreviewAction(
    projectId: string,
    testTopic: string,
    testKeyword: string
) {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    // Check admin permissions
    const { createClerkSupabaseClient } = await import('@/lib/supabase');
    const supabase = await createClerkSupabaseClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('user_id', userId)
        .single();

    if (!isSuperAdmin(profile?.email) && profile?.role !== 'admin') {
        return { success: false, error: "Forbidden: Admin access required" };
    }

    try {
        // Get project context
        const projectContext = await getContext(projectId);
        if (!projectContext) {
            return { success: false, error: "Project not found" };
        }

        // Create a mock post for prompt building
        const mockPost = {
            id: 'preview-post',
            projectId: projectId,
            topic: testTopic,
            status: 'idea' as const,
            contentPath: '',
            imagePath: '/placeholder-image.png',
            seoTitle: '',
            metaDescription: '',
            primaryKeyword: testKeyword,
            secondaryKeywords: [],
            searchIntent: 'Informational' as const,
            contentAngle: 'How-to' as const,
            targetInternalLinks: [],
            cluster: '',
            priorityScore: 0,
            notes: '',
            generateImage: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Build prompts
        const builder = new PromptBuilder(projectContext || createDefaultContext(), mockPost);
        const systemPrompt = builder.buildSystemPrompt();
        const userPrompt = builder.buildUserPrompt();

        // Calculate token estimates (rough estimate: 4 chars ≈ 1 token)
        const systemTokens = Math.ceil(systemPrompt.length / 4);
        const userTokens = Math.ceil(userPrompt.length / 4);
        const totalTokens = systemTokens + userTokens;

        return {
            success: true,
            data: {
                systemPrompt,
                userPrompt,
                systemTokens,
                userTokens,
                totalTokens,
                projectName: projectContext.domainInfo.titles[0] || 'Unknown Project',
                brandColor: projectContext.styling.brandColor || '#24442C',
                hasReferenceHtml: !!projectContext.styling.referenceHtml
            }
        };
    } catch (error: any) {
        console.error("Prompt preview error:", error);
        return {
            success: false,
            error: error.message || "Failed to generate prompt preview"
        };
    }
}
