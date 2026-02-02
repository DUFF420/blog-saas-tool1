import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';

// GET /api/projects/[projectId]/context
export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // ✅ Next.js 15: params is now a Promise
        const resolvedParams = await params;

        // Verify user owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', resolvedParams.projectId)
            .single();

        if (!project || project.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get context
        const { data: context, error } = await supabase
            .from('project_contexts')
            .select('context')
            .eq('project_id', resolvedParams.projectId)
            .single();

        if (error) {
            console.error('Error fetching context:', error);
            return NextResponse.json({}, { status: 200 }); // Return empty context if none exists
        }

        return NextResponse.json(context?.context || {});
    } catch (error) {
        console.error('Error in context API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
