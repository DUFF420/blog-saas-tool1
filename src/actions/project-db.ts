'use server';

import { createClerkSupabaseClient } from '@/lib/supabase';
import { auth } from "@clerk/nextjs/server";
import { Project, ProjectContext } from '@/types';
import { revalidatePath } from 'next/cache';

// --- PROJECTS ---

export async function getProjectsDB(): Promise<Project[]> {
    const { userId } = await auth();
    console.log("[getProjectsDB] Clerk User ID:", userId);

    if (!userId) return [];

    const supabase = await createClerkSupabaseClient();

    // Explicitly select only necessary fields and filter by user_id
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("[getProjectsDB] Supabase Error:", error);
        return [];
    }

    console.log(`[getProjectsDB] Found ${data?.length} projects for user ${userId}`);

    return data.map(p => ({
        id: p.id,
        name: p.name,
        domain: p.domain || '',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        userId: p.user_id
    }));
}

export async function createProjectDB(data: any) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { name, domain, ...contextData } = data;
    const supabase = await createClerkSupabaseClient();

    // 1. Create Project
    const { data: projectData, error: projError } = await supabase
        .from('projects')
        .insert({
            user_id: userId,
            name,
            domain
        })
        .select()
        .single();

    if (projError || !projectData) {
        throw new Error("Failed to create project: " + projError?.message);
    }

    const projectId = projectData.id;

    // 2. Save Context (if provided)
    if (Object.keys(contextData).length > 0) {
        await supabase
            .from('project_settings')
            .insert({
                project_id: projectId,
                context: contextData
            });
    }

    revalidatePath('/');
    return {
        id: projectId,
        name: projectData.name,
        domain: projectData.domain,
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at
    };
}

export async function updateProjectDB(projectId: string, data: { name: string, domain: string }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const supabase = await createClerkSupabaseClient();
    const { error } = await supabase
        .from('projects')
        .update({
            name: data.name,
            domain: data.domain,
            updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', userId);

    if (error) throw new Error(error.message);

    revalidatePath('/');
    return { success: true };
}

export async function deleteProjectDB(projectId: string) {
    const { userId } = await auth();
    console.log(`[deleteProjectDB] User: ${userId}, Project: ${projectId}`);

    if (!userId) throw new Error("Unauthorized");

    const supabase = await createClerkSupabaseClient();

    // IMPORTANT: RLS will block this if the user doesn't own the project!
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);

    if (error) {
        console.error("[deleteProjectDB] Failed:", error);
        throw new Error(error.message);
    }

    revalidatePath('/');
    return { success: true };
}

// --- CONTEXT ---

export async function getProjectContextDB(projectId: string): Promise<ProjectContext | null> {
    const { userId } = await auth();
    const supabase = await createClerkSupabaseClient();

    // 1. Verify ownership of project
    const { data: project } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

    if (!project || project.user_id !== userId) return null;

    // 2. Fetch Settings
    const { data, error } = await supabase
        .from('project_settings')
        .select('context')
        .eq('project_id', projectId)
        .single();

    if (error || !data) return null;
    return data.context;
}

export async function saveProjectContextDB(projectId: string, context: ProjectContext) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const supabase = await createClerkSupabaseClient();
    // Upsert context
    const { error } = await supabase
        .from('project_settings')
        .upsert({
            project_id: projectId, // This serves as PK
            context: context
        }, { onConflict: 'project_id' });

    if (error) throw new Error(error.message);

    revalidatePath('/context');
    return { success: true };
}

// --- EXPORT (NEW) ---

export async function getAllUserDataDB(options: { includeContext: boolean; statuses: string[] }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const supabase = await createClerkSupabaseClient();

    // 1. Get All Projects
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);

    if (error || !projects) return [];


    const result = [];

    for (const proj of projects) {
        const projData: any = {
            id: proj.id,
            name: proj.name,
            domain: proj.domain,
            created_at: proj.created_at
        };

        // 2. Fetch Context
        if (options.includeContext) {
            const { data: ctx } = await supabase
                .from('project_settings')
                .select('context')
                .eq('project_id', proj.id)
                .single();
            projData.context = ctx?.context || null;
        }

        // 3. Fetch Posts
        // Map UI statuses to DB statuses (e.g. 'drafted' might include 'approved')
        // For simplicity, we just filter by the list provided.
        if (options.statuses.length > 0) {
            // Expand statuses just in case (e.g. if 'drafted' is selected, maybe include 'approved' too?)
            // Or rely on frontend to send correct list.
            const { data: posts } = await supabase
                .from('posts')
                .select('*')
                .eq('project_id', proj.id)
                .in('status', options.statuses);
            projData.posts = posts || [];
        }

        result.push(projData);
    }

    return result;
}

export async function verifyProjectAccessDB(projectId: string): Promise<boolean> {
    const { userId } = await auth();
    if (!userId) return false;
    const supabase = await createClerkSupabaseClient();
    const { data } = await supabase.from('projects').select('id').eq('id', projectId).eq('user_id', userId).single();
    return !!data;
}
