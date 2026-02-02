'use server';

import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';

// User-facing: Register interest in product launch
export async function registerLaunchInterest(productName: string, email: string) {
    try {
        const { userId } = await auth();

        // Use service role client to bypass RLS for insertion
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabase
            .from('launch_interests')
            .insert({
                product_name: productName,
                user_id: userId,
                user_email: email
            });

        if (error) {
            console.error('Error registering interest:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in registerLaunchInterest:', error);
        return { success: false, error: 'Failed to register interest' };
    }
}
