'use server';

import { createClerkSupabaseClient } from '@/lib/supabase';
import { auth } from "@clerk/nextjs/server";
import { BlogPost, BlogPostStatus } from '@/types';
import { revalidatePath } from 'next/cache';

// --- PLANNER (POSTS) ---

import { verifyProjectAccessDB } from './project-db'; // Import Helper

export async function getPostsDB(projectId: string): Promise<BlogPost[]> {
    const { userId } = await auth();
    if (!userId) return [];

    // SECURITY CHECK
    const hasAccess = await verifyProjectAccessDB(projectId);
    if (!hasAccess) return [];

    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('project_id', projectId) // Filter by project
        .order('created_at', { ascending: false });

    if (error) {
        console.error("DB Error fetch posts", error);
        return [];
    }

    return data.map(p => ({
        id: p.id,
        projectId: p.project_id,
        topic: p.topic,
        status: p.status as BlogPostStatus || 'idea',
        contentPath: `db:${p.id}`,

        imagePath: p.image_path || '/placeholder-image.png',
        seoTitle: p.seo_title || '',
        metaDescription: p.meta_description || '',
        primaryKeyword: p.primary_keyword || '',
        secondaryKeywords: p.secondary_keywords || [],
        searchIntent: p.search_intent || 'Informational',
        contentAngle: p.content_angle || 'How-to',
        targetInternalLinks: p.target_internal_links || [],
        cluster: p.cluster || '',
        priorityScore: p.priority_score || 0,
        notes: p.notes || '',
        generateImage: p.generate_image || false,
        scheduledDate: p.scheduled_date,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    }));
}

export async function getPostByIdDB(postId: string): Promise<BlogPost | null> {
    const { userId } = await auth();
    if (!userId) return null;

    const supabase = await createClerkSupabaseClient();
    const { data: p, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

    if (error || !p) return null;

    // SECURITY CHECK: Ensure user owns the project this post belongs to
    const hasAccess = await verifyProjectAccessDB(p.project_id);
    if (!hasAccess) return null;

    return {
        id: p.id,
        projectId: p.project_id,
        topic: p.topic,
        status: p.status as BlogPostStatus || 'idea',
        contentPath: `db:${p.id}`,

        imagePath: p.image_path || '/placeholder-image.png',
        seoTitle: p.seo_title || '',
        metaDescription: p.meta_description || '',
        primaryKeyword: p.primary_keyword || '',
        secondaryKeywords: p.secondary_keywords || [],
        searchIntent: p.search_intent || 'Informational',
        contentAngle: p.content_angle || 'How-to',
        targetInternalLinks: p.target_internal_links || [],
        cluster: p.cluster || '',
        priorityScore: p.priority_score || 0,
        notes: p.notes || '',
        generateImage: p.generate_image || false,
        scheduledDate: p.scheduled_date,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    };
}

export async function savePostDB(post: BlogPost) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // SECURITY CHECK
    const hasAccess = await verifyProjectAccessDB(post.projectId);
    if (!hasAccess) throw new Error("Unauthorized to access this project");

    const supabase = await createClerkSupabaseClient();
    const updateData: any = {
        project_id: post.projectId,
        topic: post.topic,
        status: post.status,
        image_path: post.imagePath,
        seo_title: post.seoTitle,
        meta_description: post.metaDescription,
        primary_keyword: post.primaryKeyword,
        secondary_keywords: post.secondaryKeywords,
        search_intent: post.searchIntent,
        content_angle: post.contentAngle,
        target_internal_links: post.targetInternalLinks,
        cluster: post.cluster,
        priority_score: post.priorityScore,
        notes: post.notes,
        generate_image: post.generateImage,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('posts')
        .upsert({
            id: post.id,
            ...updateData
        });

    if (error) throw new Error(error.message);

    revalidatePath('/planner');
    return { success: true };
}

// Special Action for Saving Content (Text)
export async function savePostContentDB(postId: string, content: string, project_id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // SECURITY CHECK
    const hasAccess = await verifyProjectAccessDB(project_id);
    if (!hasAccess) throw new Error("Unauthorized");

    const supabase = await createClerkSupabaseClient();
    const { error } = await supabase
        .from('posts')
        .update({
            content: content,
            updated_at: new Date().toISOString()
        })
        .eq('id', postId);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function getPostContentDB(postId: string): Promise<string | null> {
    const { userId } = await auth();
    if (!userId) return null;

    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*') // Need project_id to verify
        .eq('id', postId)
        .single();

    if (error || !data) return null;

    // SECURITY CHECK
    const hasAccess = await verifyProjectAccessDB(data.project_id);
    if (!hasAccess) return null;

    return data.content;
}

export async function deletePostDB(projectId: string, postId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // SECURITY CHECK
    const hasAccess = await verifyProjectAccessDB(projectId);
    if (!hasAccess) throw new Error("Unauthorized");

    const supabase = await createClerkSupabaseClient();
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('project_id', projectId);

    if (error) throw new Error(error.message);

    revalidatePath('/planner');
    return { success: true };
}
