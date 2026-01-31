export const SUPER_ADMIN_EMAIL = 'lukeduff00@gmail.com';

/**
 * Checks if a given email belongs to the Super Admin.
 * This is the ONLY account with full system access.
 */
export function isSuperAdmin(email?: string | null): boolean {
    if (!email) return false;
    return email === SUPER_ADMIN_EMAIL;
}

/**
 * Checks if a user has access to Admin-only features (System Prompts, Admin Dashboard).
 */
export function canAccessAdminFeatures(email?: string | null): boolean {
    return isSuperAdmin(email);
}

/**
 * Checks if a user has access to WordPress integration.
 */
export function canAccessWordPress(email?: string | null): boolean {
    return isSuperAdmin(email); // Currently restricted to Admin only (Phase 1)
}
