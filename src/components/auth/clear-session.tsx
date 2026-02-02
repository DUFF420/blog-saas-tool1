'use client';

import { useEffect } from 'react';
import { logoutAccess } from '@/actions/auth';

export function ClearSession() {
    useEffect(() => {
        // Enforce cookie clearing on mount
        logoutAccess();
    }, []);

    return null;
}
