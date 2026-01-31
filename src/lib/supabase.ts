
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    // In development, we might not have keys yet, but this will crash if accessed
    // console.warn("Supabase keys missing!");
}

// Generic client (Anon)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Authenticated Client (Forwarding Clerk Token)
export async function createClerkSupabaseClient() {
    try {
        const { getToken } = await auth();
        // Use the 'supabase' template name from Clerk Dashboard
        const token = await getToken({ template: 'supabase' });

        if (!token) {
            console.warn("No Supabase token returned from Clerk. Check JWT Template configuration.");
            return supabase;
        }

        return createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });
    } catch (error: any) {
        // Log the error but don't crash the server. 
        // Returning the base 'supabase' client allows the app to load, 
        // though RLS might block certain data features until fixed.
        console.error("Clerk-Supabase Auth Error:", error.message);
        return supabase;
    }
}

// Admin Client (Service Role - Bypasses RLS)
export function createAdminSupabaseClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables. Admin features unavailable.");
    }
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
