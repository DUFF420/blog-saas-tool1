'use client';

import { useEffect } from 'react';
import { useProject } from '@/context/project-context';
import { getContext, saveContext, fetchSitemap } from '@/actions/project';

export function useSitemapAutoRefresh() {
    const { activeProject, refreshProjects } = useProject();

    useEffect(() => {
        if (!activeProject) return;

        const checkAndRefresh = async () => {
            try {
                const context = await getContext(activeProject.id);
                if (!context || !context.domainInfo || !context.domainInfo.sitemapUrl) return;

                const lastFetch = context.domainInfo.lastSitemapFetch;
                const now = new Date();
                const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

                if (!lastFetch || new Date(lastFetch) < oneDayAgo) {
                    console.log('Auto-refreshing sitemap...');
                    const result = await fetchSitemap(context.domainInfo.sitemapUrl);
                    if (result.success && result.urls) {
                        const newUrls = Array.from(new Set([...context.domainInfo.urls, ...result.urls]));

                        // Update context
                        const newContext = {
                            ...context,
                            domainInfo: {
                                ...context.domainInfo,
                                urls: newUrls,
                                lastSitemapFetch: now.toISOString()
                            }
                        };

                        await saveContext(activeProject.id, newContext);
                        console.log('Sitemap auto-refreshed successfully.');
                    }
                }
            } catch (error) {
                console.error('Failed to auto-refresh sitemap', error);
            }
        };

        checkAndRefresh();
    }, [activeProject]);
}
