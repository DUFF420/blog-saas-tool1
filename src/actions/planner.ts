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
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// 1. READ POSTS (With Stale Detection)
export async function getPosts(projectId: string) {
    const posts = await getPostsDB(projectId);

    // SAFETY CHECK: If a post is stuck in 'generating' for > 5 mins, reset it.
    // This handles cases where the server crashed or timed out.
    const now = new Date();
    let hasUpdates = false;

    for (const post of posts) {
        if (post.status === 'generating' && post.updatedAt) {
            const lastUpdate = new Date(post.updatedAt);
            const diffMinutes = (now.getTime() - lastUpdate.getTime()) / 1000 / 60;

            if (diffMinutes > 5) {
                // console.log(`[Stale Check] Resetting stuck post ${post.id}`);
                post.status = 'idea'; // Revert to idea so user can try again
                await savePostDB(post);
                hasUpdates = true;
            }
        }
    }

    // If we fixed any, fetch fresh list
    if (hasUpdates) {
        return await getPostsDB(projectId);
    }

    return posts;
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

export async function restorePostsAction(ids: string[], projectId: string) {
    try {
        const posts = await getPostsDB(projectId);
        let restoredCount = 0;

        for (const id of ids) {
            const post = posts.find(p => p.id === id);
            if (post) {
                // Determine target status
                // If it has a contentPath (indicating DB content or file), it was drafted/generated.
                // Logic: If content exists -> Drafts. Else -> Planned.
                const hasContent = !!post.contentPath;
                const newStatus: BlogPostStatus = hasContent ? 'drafted' : 'idea';

                await savePostDB({ ...post, status: newStatus, updatedAt: new Date().toISOString() });
                restoredCount++;
            }
        }
        revalidatePath('/planner');
        return { success: true, count: restoredCount };
    } catch (e) {
        console.error("Restore failed", e);
        return { success: false, error: "Failed to restore posts" };
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

export async function publishPostsAction(ids: string[], projectId: string) {
    try {
        const posts = await getPostsDB(projectId);
        let publishedCount = 0;
        let skippedCount = 0;

        for (const id of ids) {
            const post = posts.find(p => p.id === id);
            if (post) {
                // Constraint: Only publish if content exists
                if (post.contentPath) {
                    await savePostDB({ ...post, status: 'published', updatedAt: new Date().toISOString() });
                    publishedCount++;
                } else {
                    skippedCount++;
                }
            }
        }
        revalidatePath('/planner');

        if (publishedCount === 0 && skippedCount > 0) {
            return { success: false, error: "Cannot publish posts without generated content" };
        }

        return { success: true, count: publishedCount, skipped: skippedCount };
    } catch (e) {
        console.error("Publish failed", e);
        return { success: false, error: "Failed to publish posts" };
    }
}

// 6. GENERATE POST
export async function generateBlogPostAction(projectId: string, postId: string) {
    // console.log(`Generating post ${postId} for project ${projectId}...`);

    try {
        const projectContext = await getContext(projectId);
        if (!projectContext) throw new Error("Project context not found");

        const posts = await getPostsDB(projectId);
        const post = posts.find(p => p.id === postId);

        if (!post) {
            return { success: false, error: "Post not found" };
        }

        // PHASE 13: IMMEDIATE PERSISTENCE
        // Update DB status to 'generating' immediately so UI knows it's busy even if refreshed
        const generatingPost: BlogPost = { ...post, status: 'generating' };
        await savePostDB(generatingPost);

        // Revalidate immediately to show loader
        revalidatePath('/planner');

        const builder = new PromptBuilder(projectContext || createDefaultContext(), post);
        const systemPrompt = builder.buildSystemPrompt();
        const userPrompt = builder.buildUserPrompt();

        // console.log("--- GENERATED PROMPTS ---");

        // Update Status to GENERATING
        await savePostDB({ ...post, status: 'generating' });

        // AI Generation Logic
        let content = "";
        let generatedTitle = "";
        let generatedDesc = "";
        let generatedImagePath = '/placeholder-image.png';

        if (process.env.OPENAI_API_KEY) {
            // console.log("Using Real OpenAI for generation...");
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",  // ✅ Using latest GPT-4o for high-quality long-form content
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.8,  // Higher for more varied, natural writing
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

            // ✅ VALIDATE HTML OUTPUT
            // Check if AI returned plain text instead of HTML structure
            const hasHtmlTags = content.includes('<h2') || content.includes('<h3') || content.includes('<p>');
            if (!hasHtmlTags) {
                console.error("❌ AI returned plain text instead of HTML. Content preview:", content.substring(0, 200));
                return {
                    success: false,
                    error: "INVALID_OUTPUT_FORMAT",
                    details: "AI did not return HTML. Please try generating again."
                };
            }

        } else {
            return { success: false, error: "NO_API_KEY" };
        }

        // GENERATE IMAGE (If Enabled)
        if (post.generateImage !== false) {
            try {
                const imageResult = await generateBlogImageAction(projectId, postId, generatedTitle || post.topic, projectContext);
                if (imageResult.success && imageResult.url) {
                    generatedImagePath = imageResult.url;
                }
            } catch (e) {
                console.error("Image generation failed silently", e);
            }
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

    } catch (error: any) {
        console.error("Generation failed", error);

        // Quota Handling
        if (error?.status === 429 || error?.code === 'insufficient_quota') {
            return { success: false, error: "QUOTA_EXCEEDED" };
        }
        if (error?.status === 401) {
            return { success: false, error: "INVALID_API_KEY" };
        }

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
            model: "gpt-4o-mini",  // Fast but capable for metadata detection
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
            model: "gpt-4o",  // High quality for idea generation
            messages: [{ role: "system", content: prompt }],
            temperature: 0.8,  // Higher for creative ideation
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content || "[]";
        let data: any = [];
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                data = parsed;
            } else if (typeof parsed === 'object' && parsed !== null) {
                // Heuristic: Find first property that is an array
                const arrayValue = Object.values(parsed).find(v => Array.isArray(v));
                if (arrayValue) {
                    data = arrayValue; // Found the ideas array
                }
            }
        } catch (e) {
            console.error("Failed to parse AI response", e);
        }

        // Final safety guarantee
        if (!Array.isArray(data)) data = [];

        return { success: true, data: data };

    } catch (error) {
        console.error("Idea generation failed", error);
        return { success: false, error: "Idea generation failed" };
    }
}

// 7. GENERATE IMAGE ACTION
export async function generateBlogImageAction(projectId: string, postId: string, topic: string, context?: any) {
    if (!process.env.OPENAI_API_KEY) return { success: false, error: "No API Key" };

    try {
        // console.log(`Generating image for: ${topic}`);
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Simple Prompt Engineering
        // In reality, use PromptBuilder for styled prompts
        const prompt = `A professional, modern, high-quality blog post feature image for the topic: "${topic}". 
        Style: Commercial, minimal, clean, corporate, high resolution. 
        Context: ${context?.details?.niche || 'Business Service'}. 
        No text in the image.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            response_format: "url", // We fetch and save manually
        });

        const imageUrl = response.data?.[0]?.url;
        if (!imageUrl) throw new Error("No image URL returned");

        // SAVE LOCALLY (Since we are local dev)
        // Ensure public/images exists
        const publicDir = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const fileName = `${postId}-${Date.now()}.webp`; // Using webp extension but getting png likely, we'll just save raw for now or assume png
        // Actually DALL-E returns PNG usually. Let's save as png then rename or use sharp if needed. 
        // For simplicity: save as .png
        const savedFileName = `${postId}-${Date.now()}.png`;
        const localPath = path.join(publicDir, savedFileName);

        const imgRes = await fetch(imageUrl);
        if (!imgRes.body) throw new Error("Failed to fetch image stream");

        // Stream to file
        // node-fetch stream to file
        const fileStream = fs.createWriteStream(localPath);
        // @ts-ignore
        await pipeline(Readable.fromWeb(imgRes.body), fileStream);

        return { success: true, url: `/images/${savedFileName}` };

    } catch (e: any) {
        console.error("Image Gen Error", e);
        if (e?.status === 429 || e?.code === 'insufficient_quota') return { success: false, error: "QUOTA_EXCEEDED" };
        return { success: false, error: "Image Gen Failed" };
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

export async function getGeneratingPostsAction(projectId: string) {
    try {
        const { getGeneratingPostsDB } = await import('./planner-db');
        const ids = await getGeneratingPostsDB(projectId);
        return { success: true, data: ids };
    } catch (error) {
        console.error("Failed to get generating posts:", error);
        return { success: false, error: 'Failed to check status' };
    }
}
