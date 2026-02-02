'use server';

import { cookies } from 'next/headers';

export async function logoutAccess() {
    try {
        (await cookies()).delete('site_access_token');
        (await cookies()).delete('site_access');
        // We can't use 'redirect' here effectively if called from a useEffect without causing warnings, 
        // but we don't need to. The user is already on the sign-in page.
    } catch (e) {
        console.error("Failed to clear access cookies", e);
    }
}
