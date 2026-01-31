import { ProjectContext } from '@/types';

export const createDefaultContext = (): ProjectContext => ({
    domainInfo: {
        urls: [],
        titles: [],
        h1s: [],
        services: [],
        sitemapUrl: '',
    },
    business: {
        services: [],
        targetAudience: '',
        painPoints: [],
        desiredActions: [],
        locations: [],
        operationalRealities: {
            equipmentDo: [],
            equipmentDoNot: [],
            methods: [],
        },
    },
    brand: {
        tone: '',
        writingStyle: '',
        examples: [],
        doNots: [],
        readingLevel: 'Grade 8',
        complianceStance: 'General',
    },
    seoRules: {
        hTagHierarchy: true,
        shortIntro: true,
        scannableLayout: true,
        generateTLDR: true,
        semanticKeywords: true,
        includeImage: true,
        ctaGoal: "Encourage reader to take action",
        ctaLink: "",
    },
    styling: {
        referenceHtml: "",
    },
    keywords: {
        target: [],
        negative: [],
        clusters: [],
    },
    ideas: [],
    siteStructure: {
        internalLinks: [],
    },
    globalContext: "",
});
