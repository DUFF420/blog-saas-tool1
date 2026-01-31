/**
 * Simple in-memory rate limiter for production use
 * Note: Resets on server restart. For distributed systems, use Redis/Upstash
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Check if an identifier is within rate limits
 * @param identifier - Unique identifier (userId, IP, etc.)
 * @param config - Rate limit configuration
 * @returns Result with success status, remaining attempts, and reset time
 */
export function rateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const entry = store.get(identifier);

    // No existing entry or expired
    if (!entry || now > entry.resetAt) {
        const resetAt = now + config.windowMs;
        store.set(identifier, { count: 1, resetAt });
        return {
            success: true,
            remaining: config.maxAttempts - 1,
            resetAt
        };
    }

    // Increment existing entry
    entry.count++;

    // Exceeded limit
    if (entry.count > config.maxAttempts) {
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt
        };
    }

    // Within limit
    return {
        success: true,
        remaining: config.maxAttempts - entry.count,
        resetAt: entry.resetAt
    };
}

/**
 * Get current rate limit status for an identifier
 */
export function getRateLimitStatus(identifier: string): RateLimitEntry | null {
    const entry = store.get(identifier);
    if (!entry || Date.now() > entry.resetAt) return null;
    return entry;
}

/**
 * Reset rate limit for an identifier (e.g., after successful action)
 */
export function resetRateLimit(identifier: string): void {
    store.delete(identifier);
}
