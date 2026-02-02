'use client';

import dynamic from 'next/dynamic';

const AccountMenu = dynamic(() => import('./account-menu').then(mod => mod.AccountMenu), {
    ssr: false,
    loading: () => <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
});

export function ClientAccountMenu() {
    return <AccountMenu />;
}
