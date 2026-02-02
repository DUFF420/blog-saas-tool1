'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProjectSwitcher } from '@/components/project-switcher';
// import { CreateProjectDialog } from '@/components/create-project-dialog'; // Deprecated
import { CreateProjectWizard } from '@/components/create-project-wizard';
import { LayoutDashboard, FileText, Settings, BookOpen, PenTool, Wrench, Globe, Shield, Link2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/context/project-context';
import { useSitemapAutoRefresh } from '@/hooks/use-sitemap-refresh';
import Image from 'next/image';

export function Sidebar({ isAdmin, className }: { isAdmin?: boolean, className?: string }) {
    const pathname = usePathname();
    const { activeProject } = useProject();
    // useSitemapAutoRefresh(); // Disabled by user request for manual control


    const allLinks = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: false },
        { name: 'Context Vault', href: '/context', icon: BookOpen, adminOnly: false },
        { name: 'Blog Planner', href: '/planner', icon: FileText, adminOnly: false },
        { name: 'Tools', href: '/tools', icon: Wrench, adminOnly: false },
        { name: 'Organic Backlink Network', href: '/backlinks', icon: Link2, adminOnly: false, description: "Join a network of fellow Blog OS users to naturally exchange relevant backlinks and boost SEO." },
        { name: 'WordPress', href: '/wordpress', icon: Globe, adminOnly: false, description: "Direct publishing to WordPress. Coming soon!" },
    ];

    const adminLinks = [
        { name: 'Admin', href: '/admin', icon: Shield, adminOnly: true },
    ];

    const links = allLinks.filter(link => isAdmin || !link.adminOnly);

    return (
        <div className={cn("flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300", className)}>
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <div>
                        <Link href="/" className="hover:text-indigo-400 transition-colors">The Blog OS</Link>
                        <a href="https://lukeduff.co.uk" target="_blank" rel="noopener noreferrer" className="text-slate-500 font-normal text-sm block -mt-1 hover:text-slate-300 transition-colors">by Luke Duff</a>
                    </div>
                </h1>
                <div className="space-y-4">
                    <ProjectSwitcher />
                    <CreateProjectWizard />
                </div>
            </div>

            <div className="flex-1 overflow-auto py-6">
                <nav className="space-y-1 px-3">
                    {activeProject ? (
                        <div className="space-y-1">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                                // "Coming Soon" features: Organic Backlink Network & WordPress
                                const isComingSoon = link.href === '/backlinks' || link.href === '/wordpress';

                                const linkContent = (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full",
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-md"
                                                : isComingSoon
                                                    ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-dashed border-slate-700"
                                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                            isActive
                                                ? "text-indigo-200"
                                                : isComingSoon
                                                    ? "text-slate-600 group-hover:text-slate-400"
                                                    : "text-slate-500 group-hover:text-white"
                                        )} />
                                        <span className="flex-1">{link.name}</span>
                                        {isComingSoon && (
                                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-semibold ml-2 uppercase tracking-wide border border-amber-500/40">
                                                Soon
                                            </span>
                                        )}
                                    </Link>
                                );

                                if (link.description) {
                                    return (
                                        <TooltipProvider key={link.name}>
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    {linkContent}
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="max-w-[200px] bg-slate-900 border-slate-700 text-slate-200">
                                                    <p>{link.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                }

                                return linkContent;
                            })}

                            {/* Configuration Group */}
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

                            {/* Admin Bottom Group */}
                            {isAdmin && (
                                <div className="space-y-1 pt-4 mt-4 border-t border-slate-800/50">
                                    {adminLinks.map((link) => {
                                        const Icon = link.icon;
                                        const isActive = pathname === link.href || pathname.startsWith(link.href);

                                        return (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                className={cn(
                                                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full",
                                                    isActive
                                                        ? "bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-lg shadow-purple-500/20"
                                                        : "text-purple-400 hover:bg-purple-950/30 hover:text-purple-300 border border-purple-900/20"
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                                    isActive ? "text-purple-100" : "text-purple-400 group-hover:text-purple-300"
                                                )} />
                                                <span className="flex-1">{link.name}</span>
                                                <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Admin</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
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
                    v1.4.5
                </div>
            </div>
        </div>
    );
}
