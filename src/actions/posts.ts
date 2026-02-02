'use server';

import { createClient } from '@supabase/supabase-js';
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from 'next/cache';

// Mark post as viewed (for unread indicator)
export async function markPostAsViewed(postId: string) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify user owns this post
        const { data: post } = await supabase
            .from('posts')
            .select('project_id, projects!inner(user_id)')
            .eq('id', postId)
            .single();

        // @ts-ignore - Supabase typing issue with nested selects
        if (!post || post.projects?.user_id !== userId) {
            return { success: false, error: 'Forbidden' };
        }

        // Update viewed_at
        const { error } = await supabase
            .from('posts')
            .update({ viewed_at: new Date().toISOString() })
            .eq('id', postId);

        if (error) {
            console.error('Error marking post as viewed:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/planner');
        return { success: true };
    } catch (error) {
        console.error('Error in markPostAsViewed:', error);
        return { success: false, error: 'Failed to update post' };
    }
}
