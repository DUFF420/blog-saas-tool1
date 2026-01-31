'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProjectSwitcher } from '@/components/project-switcher';
// import { CreateProjectDialog } from '@/components/create-project-dialog'; // Deprecated
import { CreateProjectWizard } from '@/components/create-project-wizard';
import { LayoutDashboard, FileText, Settings, BookOpen, PenTool, Wrench, Globe, Shield } from 'lucide-react';
import { useProject } from '@/context/project-context';
import { useSitemapAutoRefresh } from '@/hooks/use-sitemap-refresh';

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
    const pathname = usePathname();
    const { activeProject } = useProject();
    useSitemapAutoRefresh(); // Trigger background check


    const allLinks = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: false },
        { name: 'Context Vault', href: '/context', icon: BookOpen, adminOnly: false },
        { name: 'Blog Planner', href: '/planner', icon: FileText, adminOnly: false },
        { name: 'Tools', href: '/tools', icon: Wrench, adminOnly: false },
        { name: 'WordPress', href: '/wordpress', icon: Globe, adminOnly: false },
        { name: 'Admin', href: '/admin', icon: Shield, adminOnly: true }, // Admin tab in main nav
    ];

    const links = allLinks.filter(link => isAdmin || !link.adminOnly);

    return (
        <div className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold tracking-tight text-white mb-6">Blog OS <span className="text-slate-500 font-normal text-sm block mt-1">by Luke Duff</span></h1>
                <div className="space-y-4">
                    <ProjectSwitcher />
                    <CreateProjectWizard />
                </div>
            </div>

            <div className="flex-1 overflow-auto py-6">
                <nav className="space-y-1 px-3">
                    {activeProject ? (
                        <div className="space-y-1">
                            {links.filter(l => !l.href.includes('/settings')).map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                                // Feature Gating: WordPress "Coming Soon" for non-admins
                                const isLocked = !isAdmin && link.href === '/wordpress';

                                if (isLocked) {
                                    return (
                                        <div key={link.name} className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-slate-500 opacity-60 cursor-not-allowed">
                                            <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-600" />
                                            <span className="flex-1">{link.name}</span>
                                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded ml-2 uppercase tracking-wide">Soon</span>
                                        </div>
                                    );
                                }

                                // Admin-only tabs get special styling
                                const isAdminTab = link.adminOnly;

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? isAdminTab
                                                    ? "bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg shadow-purple-500/20"
                                                    : "bg-indigo-600 text-white shadow-md"
                                                : isAdminTab
                                                    ? "text-purple-400 hover:bg-purple-950/30 hover:text-purple-300 border border-purple-900/20"
                                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                            isActive
                                                ? isAdminTab ? "text-purple-100" : "text-indigo-200"
                                                : isAdminTab ? "text-purple-400 group-hover:text-purple-300" : "text-slate-500 group-hover:text-white"
                                        )} />
                                        {link.name}
                                        {isAdminTab && (
                                            <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Admin</span>
                                        )}
                                    </Link>
                                );
                            })}

                            {/* Settings Dropdown Group */}
                            <div className="space-y-1 pt-2">
                                <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Configuration
                                </div>
                                <Link
                                    href="/settings"
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        pathname === '/settings'
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                    )}
                                >
                                    <Settings className={cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors", pathname === '/settings' ? "text-indigo-200" : "text-slate-500 group-hover:text-white")} />
                                    General Settings
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/settings/prompts"
                                        className={cn(
                                            "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            pathname === '/settings/prompts'
                                                ? "bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg shadow-purple-500/20"
                                                : "text-purple-400 hover:bg-purple-950/30 hover:text-purple-300 border border-purple-900/20"
                                        )}
                                    >
                                        <PenTool className={cn(
                                            "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                            pathname === '/settings/prompts' ? "text-purple-100" : "text-purple-400 group-hover:text-purple-300"
                                        )} />
                                        System Prompts
                                        <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Admin</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="px-3 text-sm text-slate-500 italic">
                            Select or create a project to view menu.
                        </div>
                    )}
                </nav>
            </div>

            <div className="p-6 border-t border-slate-800 space-y-4">
                <div className="text-xs text-slate-500">
                    v1.0.0 Local
                </div>
            </div>
        </div>
    );
}
