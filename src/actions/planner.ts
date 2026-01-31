'use server';

// --- DB MIGRATION BRIDGE ---
// This file now bridges legacy calls to the new Supabase DB implementation.

import {
    getPostsDB,
    savePostDB,
    deletePostDB,
    getPostContentDB,
    savePostContentDB,
    getPostByIdDB
} from './planner-db';
import { BlogPost, BlogPostStatus } from '@/types';
import { PromptBuilder } from '@/lib/generation/prompt-builder';
import { getContext } from '@/actions/project';
import { createDefaultContext } from '@/lib/defaults';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import path from 'path';

// 1. READ POSTS
export async function getPosts(projectId: string) {
    return await getPostsDB(projectId);
}

// 2. SAVE POST (Metadata)
export async function savePost(post: BlogPost) {
    return await savePostDB(post);
}

// 3. BULK UPDATE
export async function bulkUpdateStatus(ids: string[], status: BlogPostStatus, projectId: string) {
    try {
        const posts = await getPostsDB(projectId);
        // Simple loop for now
        for (const id of ids) {
            const target = posts.find(p => p.id === id);
            if (target) {
                await savePostDB({ ...target, status, updatedAt: new Date().toISOString() });
            }
        }
        revalidatePath('/planner');
        return { success: true, count: ids.length };
    } catch (e) {
        console.error("Bulk update failed", e);
        return { success: false, error: "Failed to update posts" };
    }
}

// 4. BULK DELETE
export async function bulkDelete(ids: string[], projectId: string) {
    try {
        for (const id of ids) {
            await deletePostDB(projectId, id);
        }
        revalidatePath('/planner');
        return { success: true };
    } catch (e) {
        console.error("Bulk delete failed", e);
        return { success: false, error: "Failed to delete" };
    }
}

// 5. IMPORT
export async function importPosts(posts: BlogPost[]) {
    for (const post of posts) {
        await savePostDB(post);
    }
    revalidatePath('/planner');
    return { success: true };
}

// 6. GENERATE POST
export async function generateBlogPostAction(projectId: string, postId: string) {
    console.log(`Generating post ${postId} for project ${projectId}...`);

    try {
        const projectContext = await getContext(projectId);
        const posts = await getPostsDB(projectId);
        const post = posts.find(p => p.id === postId);

        if (!post) {
            return { success: false, error: "Post not found" };
        }

        const builder = new PromptBuilder(projectContext || createDefaultContext(), post);
        const systemPrompt = builder.buildSystemPrompt();
        const userPrompt = builder.buildUserPrompt();

        console.log("--- GENERATED PROMPTS ---");

        // Update Status to GENERATING
        await savePostDB({ ...post, status: 'generating' });

        // AI Generation Logic
        let content = "";
        let generatedTitle = "";
        let generatedDesc = "";
        let generatedImagePath = '/placeholder-image.png';

        if (process.env.OPENAI_API_KEY) {
            console.log("Using Real OpenAI for generation...");
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
            });

            content = completion.choices[0].message.content || "";

            // Parse Metadata
            let metadata = null;
            let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    metadata = JSON.parse(jsonMatch[1]);
                    content = content.replace(jsonMatch[0], '').trim();
                } catch (e) { console.error("Error parsing JSON block", e); }
            }

            // Fallback parsing (simplified from original for brevity/robustness in DB context)
            if (!metadata) {
                const firstBrace = content.indexOf('{');
                const lastBrace = content.indexOf('}');
                if (firstBrace > -1 && lastBrace > firstBrace) {
                    const prefix = content.substring(0, firstBrace).trim();
                    if (prefix === '') {
                        const potentialJson = content.substring(firstBrace, lastBrace + 1);
                        try {
                            metadata = JSON.parse(potentialJson);
                            content = content.replace(potentialJson, '').trim();
                        } catch (e) { }
                    }
                }
            }

            if (metadata) {
                generatedTitle = metadata.seoTitle || generatedTitle;
                generatedDesc = metadata.metaDescription || generatedDesc;
            }

            if (content.startsWith('```html')) {
                content = content.replace(/^```html/, '').replace(/```$/, '');
            }

        } else {
            // Simulation
            await new Promise(resolve => setTimeout(resolve, 2000));
            content = `<h1>[SIMULATION] ${post.topic}</h1><p>Simulated content.</p>`;
            generatedTitle = `Simulated Title`;
            generatedDesc = "Simulated Desc";
        }

        // SAVE CONTENT TO DB
        await savePostContentDB(postId, content, projectId);

        // SAVE METADATA TO DB
        const updatedPost: BlogPost = {
            ...post,
            status: 'drafted',
            contentPath: `db:${postId}`, // Special marker
            imagePath: generatedImagePath,
            seoTitle: generatedTitle,
            metaDescription: generatedDesc
        };
        await savePostDB(updatedPost);

        revalidatePath('/planner');
        return { success: true, message: "Generation complete" };

    } catch (error) {
        console.error("Generation failed", error);
        return { success: false, error: "Generation failed" };
    }
}

// ... (Metadata detection logic) ...

export async function detectPostMetadataAction(projectId: string, topic: string) {
    if (!process.env.OPENAI_API_KEY) {
        return { success: true, data: { searchIntent: 'Informational', contentAngle: 'How-to' } };
    }
    try {
        const projectContext = await getContext(projectId);
        const builder = new PromptBuilder(projectContext || createDefaultContext());
        const prompt = builder.buildMetadataDetectionPrompt(topic);
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });
        const result = JSON.parse(completion.choices[0].message.content || "{}");
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: "Failed to detect metadata" };
    }
}

export async function generateBlogIdeasAction(projectId: string, count: number, goal: string, strategy: 'long-tail' | 'mix') {
    if (!process.env.OPENAI_API_KEY) return { success: false, error: "OpenAI API Key required" };

    try {
        const projectContext = await getContext(projectId);
        const builder = new PromptBuilder(projectContext || createDefaultContext());
        const prompt = builder.buildIdeaGenerationSystemPrompt(count, goal, strategy);

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content || "[]";
        let data = [];
        try {
            data = JSON.parse(content);
            if (!Array.isArray(data)) {
                const keys = Object.keys(data);
                if (keys.length === 1 && Array.isArray(data[keys[0]])) data = data[keys[0]];
            }
        } catch (e) { }

        return { success: true, data: data };

    } catch (error) {
        console.error("Idea generation failed", error);
        return { success: false, error: "Idea generation failed" };
    }
}

// Helper to get a single post by ID (scanning projects for now)
export async function getPostById(postId: string): Promise<BlogPost | null> {
    return await getPostByIdDB(postId);
}

// Helper to read content file/db
export async function getPostContent(projectId: string, filePath: string): Promise<string | null> {
    if (filePath && filePath.startsWith('db:')) {
        const id = filePath.replace('db:', '');
        return await getPostContentDB(id);
    }
    return null;
}
