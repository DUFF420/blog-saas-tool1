'use server';

import { createClerkSupabaseClient } from '@/lib/supabase';
import { auth } from "@clerk/nextjs/server";
import { Project, ProjectContext } from '@/types';
import { revalidatePath } from 'next/cache';

// --- PROJECTS ---

export async function getProjectsDB(): Promise<Project[]> {
    const { userId } = await auth();
    if (!userId) return [];

    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId) // Security: Double check (RLS + Filter)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error("DB Error fetch projects", error);
        return [];
    }

    // Map snake_case DB to camelCase Types
    return data.map(p => ({
        id: p.id,
        name: p.name,
        domain: p.domain,
        createdAt: p.created_at,
        updatedAt: p.updated_at
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
    if (!userId) throw new Error("Unauthorized");

    const supabase = await createClerkSupabaseClient();
    // Cascade delete in Postgres handles child tables (posts, settings)
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);

    if (error) throw new Error(error.message);

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
