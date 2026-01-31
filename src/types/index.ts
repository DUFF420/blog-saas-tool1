export type Project = {
    id: string;
    name: string;
    domain: string;
    createdAt: string;
    updatedAt: string;
};

export type ProjectContext = {
    domainInfo: {
        urls: string[];
        titles: string[];
        h1s: string[];
        services: string[];
        sitemapUrl?: string;
        lastSitemapFetch?: string; // ISO Date string
    };
    brand: {
        tone: string;
        writingStyle: string;
        examples: string[];
        doNots: string[];
        readingLevel: string;
        complianceStance: 'Strict' | 'General' | 'Helpful'; // How to handle regulations
    };
    business: {
        services: string[]; // Primary products or services
        targetAudience: string;
        painPoints: string[];
        desiredActions: string[];
        locations: string[]; // Target GEOs for SEO
        operationalRealities: {
            equipmentDo: string[]; // Specific kit used (e.g. Skid steer)
            equipmentDoNot: string[]; // Kit NOT used (e.g. leaf blowers)
            methods: string[]; // Specific ways of working
        };
    };
    seoRules: {
        hTagHierarchy: boolean;
        shortIntro: boolean; // Direct answer, no fluff, max 4 sentences
        scannableLayout: boolean;
        generateTLDR: boolean; // 3-5 bullet points summary after intro
        semanticKeywords: boolean; // Focus on natural variation
        includeImage: boolean; // Generate one topic-based image
        ctaGoal: string; // E.g. "Drive traffic to contact form"
        ctaLink: string; // The destination URL
    };
    styling: {
        referenceHtml: string; // Example HTML blog post with integrated CSS/classes
    };
    keywords: {
        target: string[];
        negative: string[];
        clusters: { name: string; keywords: string[] }[];
    };
    ideas: string[]; // Raw ideas, keywords, topics
    globalContext: string; // High level overview/background
    siteStructure: {
        internalLinks: { url: string; anchor: string; equity: number }[];
    };
    wordpressNotes?: string; // User notes for the coming soon WP page
};

export type BlogPostStatus = 'idea' | 'generating' | 'drafted' | 'approved' | 'saved' | 'trash' | 'published';

export type BlogPost = {
    id: string;
    projectId: string;
    topic: string;
    seoTitle: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    searchIntent: string;
    contentAngle: 'How-to' | 'Comparison' | 'Best-for-X' | 'Alternatives' | 'Cost' | 'Mistakes' | 'Universal' | 'News-Update' | 'Opinion';
    targetInternalLinks: string[];
    cluster: string;
    priorityScore: number;
    status: BlogPostStatus;
    scheduledDate?: string;
    createdAt?: string; // ISO Date of creation
    updatedAt?: string; // ISO Date of last update
    notes: string;
    contentPath?: string; // Path to MD file
    imagePath?: string; // Path to generated image
    metaDescription?: string; // Yoast/SEO Meta Description
    generateImage?: boolean; // Toggle for AI image generation
};
