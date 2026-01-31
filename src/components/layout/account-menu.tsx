'use client';

import { UserButton } from '@clerk/nextjs';

export function AccountMenu() {
    return (
        <div className="flex items-center gap-4">
            <UserButton
                appearance={{
                    elements: {
                        avatarBox: "w-10 h-10 ring-2 ring-indigo-500/20 hover:ring-indigo-500/40 transition-all",
                        userButtonPopoverCard: "bg-slate-950 border border-slate-800",
                        userButtonPopoverActionButton: "text-slate-300 hover:text-white hover:bg-slate-900",
                        userButtonPopoverActionButtonText: "text-slate-300",
                        userButtonPopoverFooter: "hidden"
                    }
                }}
                afterSignOutUrl="/sign-in"
            />
        </div>
    );
}
