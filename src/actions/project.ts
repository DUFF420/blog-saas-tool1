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
// --- 1. SITEMAP UTILITY ---
export async function fetchSitemap(url: string, options: { shallow?: boolean } = { shallow: false }) {
    try {
        console.log(`Fetching sitemap: ${url} (Shallow: ${options.shallow})`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; BlogOS/1.0; +http://localhost:3000)'
            }
        });
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

        const xml = await response.text();
        const parser = new XMLParser();
        const result = parser.parse(xml);

        // CASE 1: Sitemap Index (List of other sitemaps)
        if (result.sitemapindex && result.sitemapindex.sitemap) {
            const entries = Array.isArray(result.sitemapindex.sitemap) ? result.sitemapindex.sitemap : [result.sitemapindex.sitemap];
            const childSitemaps = entries.map((u: any) => u.loc);

            if (options.shallow) {
                // Return list of sitemaps for user selection
                return {
                    success: true,
                    type: 'sitemapindex',
                    sitemaps: childSitemaps,
                    urls: []
                };
            } else {
                // Recursive Fetch (Legacy / Smart Auto)
                console.log(`Found index with ${childSitemaps.length} children. Recursing...`);
                let allUrls: Set<string> = new Set();

                for (const childUrl of childSitemaps) {
                    try {
                        const childResult = await fetchSitemap(childUrl, { shallow: false }); // Force deep
                        if (childResult.success && childResult.urls) {
                            childResult.urls.forEach((u: string) => allUrls.add(u));
                        }
                    } catch (e) {
                        console.error(`Failed to fetch child ${childUrl}`, e);
                    }
                }
                return { success: true, type: 'urlset', urls: Array.from(allUrls) };
            }
        }
        // CASE 2: Standard UrlSet (List of pages)
        else if (result.urlset && result.urlset.url) {
            const entries = Array.isArray(result.urlset.url) ? result.urlset.url : [result.urlset.url];
            const urls = entries.map((u: any) => u.loc).filter((u: any) => u);
            return { success: true, type: 'urlset', urls: urls, sitemaps: [] };
        }

        return { success: false, error: "Unknown sitemap format" };
    } catch (error: any) {
        console.error("Sitemap fetch error", error);
        return { success: false, error: error.message || "Failed to fetch sitemap" };
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

// --- 4. SMART SITEMAP AUTO-DETECTION ---

import { autoDetectSitemap, type SitemapType, type SitemapDetectionResult } from '@/lib/sitemap-detector';

/**
 * Server action to auto-detect sitemap URLs using common patterns
 * 
 * @param domain - Base domain (e.g., "https://example.com")
 * @param type - Type of sitemap ('posts' or 'pages')
 * @returns Detection result with found URL and attempt history
 */
export async function autoDetectSitemapAction(
    domain: string,
    type: SitemapType
): Promise<SitemapDetectionResult> {
    try {
        const result = await autoDetectSitemap(domain, type);
        return result;
    } catch (error: any) {
        return {
            success: false,
            attemptedPatterns: [],
            error: error.message || 'Failed to auto-detect sitemap'
        };
    }
}
