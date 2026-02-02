'use client';

import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function MobileNav({ isAdmin }: { isAdmin?: boolean }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close sheet on navigation
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <div className="sticky top-0 z-30 flex items-center justify-between w-full border-b border-slate-200 bg-white p-4 lg:hidden shadow-sm">
            <div className="flex items-center gap-2">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <Menu className="h-6 w-6 text-slate-600" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-0 bg-slate-950 w-72">
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        {/* We override the height/width of sidebar to fit the sheet */}
                        <Sidebar
                            isAdmin={isAdmin}
                            className="h-full w-full border-0"
                        />
                    </SheetContent>
                </Sheet>
                <span className="font-bold text-lg text-slate-900">Blog OS</span>
            </div>

            {/* Right side - preserved for account menu via layout, but we can put a placeholder or basic action here if needed */}
        </div>
    );
}
