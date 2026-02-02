import { z } from 'zod';

/**
 * Input validation schemas for server actions
 */

export const AccessCodeSchema = z.object({
    code: z.string()
        .min(1, "Access code required")
        .max(100, "Code too long")
        .trim()
});

export const ProjectSchema = z.object({
    name: z.string()
        .min(1, "Name required")
        .max(200, "Name too long")
        .trim(),
    url: z.string()
        .url("Valid URL required")
        .max(500, "URL too long"),
    description: z.string()
        .max(1000, "Description too long")
        .optional(),
});

export const PostSchema = z.object({
    topic: z.string()
        .min(1, "Topic required")
        .max(300, "Topic too long")
        .trim(),
    seoTitle: z.string()
        .max(60, "SEO title should be under 60 characters")
        .optional(),
    primaryKeyword: z.string()
        .max(100, "Keyword too long")
        .optional(),
    secondaryKeywords: z.array(z.string().max(100))
        .max(10, "Too many secondary keywords")
        .optional(),
    searchIntent: z.enum(['Informational', 'Transactional', 'Navigational', 'Commercial'])
        .optional(),
    contentAngle: z.string()
        .max(200, "Content angle too long")
        .optional(),
    metaDescription: z.string()
        .max(160, "Meta description should be under 160 characters")
        .optional(),
    notes: z.string()
        .max(2000, "Notes too long")
        .optional(),
});

export const FeatureRequestSchema = z.object({
    request: z.string()
        .min(1, "Request cannot be empty")
        .max(5000, "Request too long")
        .trim(),
    source: z.enum(['header', 'wordpress', 'backlinks', 'general'])
        .default('general')
});

export const ContextItemSchema = z.object({
    type: z.enum([
        'business_info',
        'brand_voice',
        'products',
        'target_seo_urls',
        'faq_schema',
        'internal_links',
        'tech_stack',
        'custom'
    ]),
    key: z.string()
        .min(1, "Key required")
        .max(100, "Key too long"),
    value: z.string()
        .min(1, "Value required")
        .max(10000, "Value too long"),
});

export const UserIdSchema = z.string()
    .min(1, "User ID required")
    .regex(/^user_[A-Za-z0-9]+$/, "Invalid Clerk user ID format");

export const EmailSchema = z.string()
    .email("Invalid email address")
    .max(254, "Email too long");

/**
 * Helper function to validate input and return typed result
 */
export function validateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // Return first error message
    const errorObj = result.error as any;
    const firstError = errorObj.errors?.[0] || errorObj.issues?.[0];

    return {
        success: false,
        error: firstError?.message || "Invalid input format"
    };
}
