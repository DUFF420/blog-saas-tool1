'use server';

// --- DB MIGRATION BRIDGE ---
// This file routes actions to the Supabase implementation.
// Legacy file-system logic is replaced.

import {
    getProjectsDB,
    createProjectDB,
    getProjectContextDB,
    saveProjectContextDB,
    updateProjectDB,
    deleteProjectDB as deleteProjectDBImpl,
    getAllUserDataDB
} from './project-db';
import { ProjectContext } from '@/types';
import { XMLParser } from 'fast-xml-parser';

// --- 1. SITEMAP UTILITY (Preserved) ---
export async function fetchSitemap(url: string) {
    try {
        console.log(`Fetching sitemap: ${url}`);
        const response = await fetch(url);
        const xml = await response.text();
        const parser = new XMLParser();
        const result = parser.parse(xml);

        let urls: Set<string> = new Set();

        // Handle standard sitemap (urlset)
        if (result.urlset && result.urlset.url) {
            const entries = Array.isArray(result.urlset.url) ? result.urlset.url : [result.urlset.url];
            entries.forEach((u: any) => {
                if (u.loc) urls.add(u.loc);
            });
        }
        // Handle sitemap index (sitemapindex) - Recursive Fetch
        else if (result.sitemapindex && result.sitemapindex.sitemap) {
            const entries = Array.isArray(result.sitemapindex.sitemap) ? result.sitemapindex.sitemap : [result.sitemapindex.sitemap];
            const childSitemaps = entries.map((u: any) => u.loc);

            console.log(`Found sitemap index with ${childSitemaps.length} children. Fetching recursively...`);

            for (const childUrl of childSitemaps) {
                try {
                    const childResult = await fetchSitemap(childUrl);
                    if (childResult.success && childResult.urls) {
                        childResult.urls.forEach(u => urls.add(u));
                    }
                } catch (e) {
                    console.error(`Failed to fetch child sitemap ${childUrl}`, e);
                }
            }
        }

        return { success: true, urls: Array.from(urls) };
    } catch (error) {
        console.error("Sitemap fetch error", error);
        return { success: false, error: "Failed to fetch sitemap" };
    }
}

// --- 2. PROJECT ACTIONS (DB Wired) ---

export async function getAllProjects() {
    return await getProjectsDB();
}

export async function createProject(data: any) {
    return await createProjectDB(data);
}

export async function getContext(projectId: string) {
    return await getProjectContextDB(projectId);
}

export async function saveContext(projectId: string, context: ProjectContext) {
    return await saveProjectContextDB(projectId, context);
}

export async function updateProject(projectId: string, data: { name: string, domain: string }) {
    return await updateProjectDB(projectId, data);
}

export async function deleteProject(projectId: string) {
    return await deleteProjectDBImpl(projectId);
}

// --- 3. EXPORT ---

export async function exportAllData(options: { includeContext: boolean, statuses: string[] }) {
    try {
        const data = await getAllUserDataDB(options);
        return { success: true, data: JSON.stringify(data, null, 2) };
    } catch (e: any) {
        console.error("Export error", e);
        return { success: false, error: e.message };
    }
}
