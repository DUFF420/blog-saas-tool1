/**
 * Smart Sitemap Detection Library
 * 
 * Automatically detects common sitemap URL patterns used by WordPress and popular SEO plugins.
 * Supports: Yoast SEO, RankMath, All in One SEO, WordPress Core, and generic patterns.
 */

export const SITEMAP_PATTERNS = {
    posts: [
        '/post-sitemap.xml',              // Yoast SEO (most common)
        '/sitemap_index.xml',             // RankMath sitemap index
        '/post_type-post-sitemap.xml',    // RankMath specific
        '/wp-sitemap-posts-post-1.xml',   // WordPress Core 5.5+
        '/sitemap.xml',                   // Generic/AIOSEO fallback
    ],
    pages: [
        '/page-sitemap.xml',              // Yoast SEO (most common)
        '/page_type-page-sitemap.xml',    // RankMath specific
        '/wp-sitemap-pages-1.xml',        // WordPress Core 5.5+
        '/pages-sitemap.xml',             // Alternative naming
        '/sitemap.xml',                   // Generic fallback
    ]
} as const;

export type SitemapType = 'posts' | 'pages';

export interface SitemapDetectionResult {
    success: boolean;
    foundUrl?: string;
    pattern?: string;
    attemptedPatterns: Array<{
        url: string;
        found: boolean;
        responseTime?: number;
    }>;
    error?: string;
}

interface SitemapCheckResult {
    exists: boolean;
    responseTime: number;
    status?: number;
}

/**
 * Check if a sitemap URL exists using a lightweight HEAD request
 */
async function checkSitemapExists(url: string): Promise<SitemapCheckResult> {
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'BlogOS-SitemapDetector/1.0'
            }
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        // Consider 200 and 301/302 as valid (redirects to actual sitemap)
        const exists = response.ok || (response.status >= 300 && response.status < 400);

        return {
            exists,
            responseTime,
            status: response.status
        };
    } catch (error: any) {
        const responseTime = Date.now() - startTime;

        // Timeout or network error
        return {
            exists: false,
            responseTime
        };
    }
}

/**
 * Normalize domain URL (ensure proper format)
 */
function normalizeDomain(domain: string): string {
    let normalized = domain.trim();

    // Add https:// if no protocol
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = 'https://' + normalized;
    }

    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');

    return normalized;
}

/**
 * Auto-detect sitemap URL by trying common patterns
 * 
 * @param domain - Base domain (e.g., "https://example.com")
 * @param type - Type of sitemap to detect ('posts' or 'pages')
 * @returns Detection result with found URL or error
 * 
 * @example
 * const result = await autoDetectSitemap('https://lukeduff.co.uk', 'posts');
 * if (result.success) {
 *   console.log(`Found sitemap: ${result.foundUrl}`);
 * }
 */
export async function autoDetectSitemap(
    domain: string,
    type: SitemapType
): Promise<SitemapDetectionResult> {
    const normalizedDomain = normalizeDomain(domain);
    const patterns = SITEMAP_PATTERNS[type];
    const attemptedPatterns: SitemapDetectionResult['attemptedPatterns'] = [];

    // Try each pattern sequentially (could be parallelized for speed)
    for (const pattern of patterns) {
        const testUrl = normalizedDomain + pattern;
        const checkResult = await checkSitemapExists(testUrl);

        attemptedPatterns.push({
            url: testUrl,
            found: checkResult.exists,
            responseTime: checkResult.responseTime
        });

        if (checkResult.exists) {
            return {
                success: true,
                foundUrl: testUrl,
                pattern,
                attemptedPatterns
            };
        }
    }

    // No sitemap found after trying all patterns
    return {
        success: false,
        attemptedPatterns,
        error: `No ${type} sitemap found. Tried ${patterns.length} common patterns.`
    };
}

/**
 * Try all patterns in parallel for faster detection (more aggressive)
 * Use this if you need speed over being "polite" to the server
 */
export async function autoDetectSitemapParallel(
    domain: string,
    type: SitemapType
): Promise<SitemapDetectionResult> {
    const normalizedDomain = normalizeDomain(domain);
    const patterns = SITEMAP_PATTERNS[type];

    const checks = patterns.map(async (pattern) => {
        const testUrl = normalizedDomain + pattern;
        const result = await checkSitemapExists(testUrl);
        return {
            pattern,
            url: testUrl,
            found: result.exists,
            responseTime: result.responseTime
        };
    });

    const results = await Promise.all(checks);
    const found = results.find(r => r.found);

    if (found) {
        return {
            success: true,
            foundUrl: found.url,
            pattern: found.pattern,
            attemptedPatterns: results
        };
    }

    return {
        success: false,
        attemptedPatterns: results,
        error: `No ${type} sitemap found. Tried ${patterns.length} common patterns.`
    };
}

/**
 * Get human-readable name for sitemap pattern
 */
export function getPatternName(pattern: string): string {
    const names: Record<string, string> = {
        '/post-sitemap.xml': 'Yoast SEO (Posts)',
        '/page-sitemap.xml': 'Yoast SEO (Pages)',
        '/sitemap_index.xml': 'RankMath (Index)',
        '/post_type-post-sitemap.xml': 'RankMath (Posts)',
        '/page_type-page-sitemap.xml': 'RankMath (Pages)',
        '/wp-sitemap-posts-post-1.xml': 'WordPress Core (Posts)',
        '/wp-sitemap-pages-1.xml': 'WordPress Core (Pages)',
        '/pages-sitemap.xml': 'Alternative (Pages)',
        '/sitemap.xml': 'Generic/AIOSEO'
    };

    return names[pattern] || pattern;
}
