import { ProjectContext, BlogPost } from '@/types';

/**
 * PROMPT BUILDER - TWO-LAYER CONTEXT MODEL
 * 
 * This class implements a strict separation of concerns:
 * 
 * LAYER 1: GLOBAL / ENGINE CONTEXT (Fixed System Logic)
 * - Defines STRINGS, FORMATS, and RULES (SEO, HTML structure, Safety).
 * - These are immutable and applied to ALL projects.
 * - Source: Hardcoded template strings in this file.
 * 
 * LAYER 2: PROJECT / BRAND CONTEXT (Variable Data)
 * - Defines WHO, WHAT, and WHERE (Tone, Audience, Services, Locations).
 * - These are dynamic inputs injected into Layer 1 templates.
 * - Source: `this.context` object (ProjectContext).
 * 
 * RULE: Layer 2 data must NEVER override Layer 1 structural rules.
 */
export class PromptBuilder {
    private context: ProjectContext;
    private post?: BlogPost;

    constructor(context: ProjectContext, post?: BlogPost) {
        this.context = context;
        this.post = post;
    }

    public buildSystemPrompt(): string {
        if (!this.post) throw new Error("BlogPost is required to build system prompt.");
        const { brand, business, seoRules, styling, globalContext, domainInfo } = this.context;
        const post = this.post;

        // Filter out current page from potential links
        const availableLinks = domainInfo.urls.filter(url =>
            !url.includes(post.primaryKeyword.toLowerCase().replace(/\s+/g, '-'))
        ).slice(0, 50);

        const prompt = [
            `You are an expert SEO Content Writer and Conversion Copywriter for "${domainInfo.titles[0] || 'the client'}".`,
            `Your goal is to write a comprehensive, high-ranking, LONG-FORM blog post (Target: 800-1200 words) that strictly adheres to the provided internal guidelines.`,
            ``,
            `### 🚨 CRITICAL OUTPUT FORMAT (READ FIRST)`,
            ``,
            `**YOU MUST OUTPUT VALID HTML. NOT PLAIN TEXT. NOT MARKDOWN.**`,
            ``,
            `**REQUIRED OUTPUT STRUCTURE:**`,
            `1. Start with a JSON metadata block (wrapped in \`\`\`json ... \`\`\`)`,
            `2. Follow IMMEDIATELY with HTML content that MUST include:`,
            `   - Proper HTML tags: <h2>, <h3>, <h4>, <p>, <ul>, <li>, <a>, <strong>`,
            `   - Inline CSS styles for brand colors on ALL headings`,
            `   - Correct heading hierarchy: H2 → H3 → H4 (never skip levels)`,
            `   - Internal links (<a href="...">) naturally woven into paragraphs`,
            `   - Bold text (<strong>) for emphasis and scannability`,
            `   - Proper paragraph breaks with <p> tags`,
            ``,
            `**FORBIDDEN OUTPUT FORMATS:**`,
            `- ❌ Plain text without HTML tags`,
            `- ❌ Markdown formatting (**, ##, -, etc.)`,
            `- ❌ Missing heading tags (just bold text)`,
            `- ❌ No inline styles on headings (missing color/size),`,
            ``,
            `**OUTPUT VALIDATION CHECKLIST:**`,
            `Before submitting, verify your output contains:`,
            `- [ ] At least 3 <h2> tags with inline color styles`,
            `- [ ] Multiple <p> tags wrapping paragraphs`,
            `- [ ] At least 2 <a href="..."> internal links`,
            `- [ ] <strong> tags for key terms`,
            `- [ ] Proper HTML structure (not plain text)`,
            ``,
            `---`,
            ``,
            `### 📋 HTML/CSS STYLING TEMPLATE (MANDATORY)`,
            ``,
            `**THE CLIENT HAS PROVIDED THIS EXACT HTML STRUCTURE AND STYLING.**`,
            `**YOU MUST FOLLOW THIS AS YOUR PRIMARY TEMPLATE.**`,
            ``,
            `**CRITICAL INSTRUCTIONS:**`,
            `1. **Copy the class structure exactly** (e.g., .db-blog, .callout, .cta)`,
            `2. **Match heading styles precisely** (colors, sizes, underlines, spacing)`,
            `3. **Use the same typography and spacing** shown in the reference`,
            `4. **Apply brand colors using inline CSS** on every <h2>, <h3>, <h4> tag`,
            ``,
            `**BRAND COLOR (STRICT):** ${styling.brandColor || '#24442C'}`,
            `- You MUST use this EXACT hex code on all headings`,
            `- DO NOT lighten, darken, or modify this color`,
            `- Example: <h2 style="color: ${styling.brandColor || '#24442C'};">Your Heading</h2>`,
            ``,
            `**PROJECT-SPECIFIC REFERENCE HTML:**`,
            `\`\`\`html`,
            `${styling.referenceHtml || '<!-- No reference HTML provided. Use fallback: Professional HD Design with H2 (2.5rem, bold, brand color), P (1.125rem, line-height 1.8), proper spacing. -->'}`,
            `\`\`\``,
            ``,
            `**IF NO REFERENCE PROVIDED (FALLBACK ONLY):**`,
            `When no custom HTML/CSS is provided, you MUST use these specific inline styles to ensure a clean, professional "SaaS" look (avoiding huge default browser headings):`,
            `- H2: Use <h2 style="color: ${styling.brandColor || '#24442C'}; font-size: 26px; font-weight: 700; margin-top: 32px; margin-bottom: 16px;">`,
            `- H3: Use <h3 style="color: ${styling.brandColor || '#24442C'}; font-size: 22px; font-weight: 600; margin-top: 24px; margin-bottom: 12px;">`,
            `- P: Use <p style="line-height: 1.7; margin-bottom: 16px;">`,
            `- A: Use <a style="color: inherit; font-weight: 600; text-decoration: underline;">`,
            ``,
            `---`,
            ``,
            `### GLOBAL CONTEXT & SOURCE OF TRUTH`,
            `${globalContext || 'No global context provided.'}`,
            ``,
            `### TARGET AUDIENCE & BUSINESS GOALS`,
            `- **Audience**: ${business.targetAudience}`,
            `- **Primary Offerings**: ${business.services?.join(', ') || 'N/A'}`,
            `- **Pain Points**: ${business.painPoints.join(', ')}`,
            `- **Business Goal**: ${business.desiredActions.join(', ')}`,
            `- **Target Locations (GEO)**: ${business.locations?.join(', ') || 'Global/No specific location'}`,
            ``,
            `### BRAND VOICE & TONE (STRICT)`,
            `- **Tone**: ${brand.tone}`,
            `- **Style**: ${brand.writingStyle}`,
            `- **Reading Level**: ${brand.readingLevel}`,
            `- **Do NOT**: ${brand.doNots.join(', ')}`,
            `⚠️ **QUALITY RULE**: No generic "marketing fluff" or AI-isms like "In today's fast paced world". Speak directly to the industry peer.`,
            ``,
            `### CONTENT STRUCTURE & SEO RULES (STRICT)`,
            ``,
            `**1. Focus & Intent:**`,
            `- Focus ONLY on the primary intent: "${this.post.searchIntent}"`,
            `- Choose ONE structure (List, Guide, or Comparison) and stick to it`,
            ``,
            `**2. Introduction (CRITICAL):**`,
            `- Hook the reader immediately (max 4 sentences)`,
            `- **MUST** include primary keyword ("${this.post.primaryKeyword}") in first 2 sentences`,
            `- Use proper <p> tags`,
            ``,
            `**3. TL;DR Section (MANDATORY):**`,
            `- Add <h2 style="color: ${styling.brandColor || '#24442C'};">TL;DR</h2> immediately after intro`,
            `- Bulleted list (<ul><li>) summarizing key points`,
            `- Naturally include primary keyword in summary`,
            ``,
            `**4. Main Body (800-1200 words):**`,
            `- **Heading Hierarchy (STRICT):**`,
            `  - Main sections: <h2 style="color: ${styling.brandColor || '#24442C'};">Section Title</h2>`,
            `  - Subsections: <h3 style="color: ${styling.brandColor || '#24442C'};">Subsection</h3>`,
            `  - Detail points: <h4> (if absolutely necessary)`,
            `  - NEVER skip levels (H2 → H4)`,
            `- **Structure:** Prefer 3-5 deep sections (200-300 words each) over 10 shallow ones`,
            `- **Paragraphs:** Short (1-3 sentences) but numerous. Wrap each in <p> tags`,
            `- **Formatting:** Use <strong> tags for key terms and concepts`,
            ``,
            `**5. Internal Linking (MANDATORY):**`,
            `- Include 2-3 internal links total (INCLUDING CTA link at end)`,
            `- Weave naturally within body paragraphs using <a href="URL">anchor text</a>`,
            `- Example: <p>For businesses managing large areas, <a href="/services">professional grounds maintenance</a> ensures safety.</p>`,
            `- **Available Links:** `,
            `  ${availableLinks.length > 0 ? availableLinks.join('\n  ') : "Fallback: /services, /about, /contact"}`,
            ``,
            `** 6. Keyword Integration:** `,
            `- Primary keyword in: Intro, TL; DR, at least one < h2 > heading`,
            `- Semantic variations throughout(natural, not forced)`,
            ``,
            `** 7. Localization:** `,
            `- Mention target locations naturally: ${business.locations && business.locations.length > 0 ? business.locations.join(', ') : "UK (national coverage)"} `,
            ``,
            `** 8. FAQ Section(MANDATORY):** `,
            `- Add < h2 style = "color: ${styling.brandColor || '#24442C'};" > Frequently Asked Questions </h2> at bottom`,
            `- Include 3 high-value questions (Cost, Timeframes, Safety)`,
            `- Use proper HTML structure`,
            ``,
            `**9. Conclusion & CTA (STRICT STRUCTURE):**`,
            `- **Header**: Clear concluding H2 header`,
            `- **Subheader**: Persuasive H3 subheader based on: "${seoRules.ctaGoal}"`,
            `- **Action**: A standalone Call-to-Action button below the text.`,
            `- **Button HTML**: <a href="${this.getFallbackCtaLink()}" style="background-color: ${styling.brandColor || '#24442C'}; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-top: 16px;">${seoRules.ctaGoal || 'Contact Us'}</a>`,
            ``,
            `### ⚠️ QUALITY RULES (ANTI-FLUFF)`,
            ``,
            `**FORBIDDEN:**`,
            `- ❌ Filler sentences to hit word count`,
            `- ❌ Repetitive explanations or generic statements`,
            `- ❌ Forced internal links in unrelated sections`,
            ``,
            `**REQUIRED:**`,
            `- ✅ Substantial, value-packed sections with real insights`,
            `- ✅ Every sentence serves a purpose (educates, informs, persuades)`,
            `- ✅ Natural linking when context genuinely supports it`,
            ``,
            `**Quality Test:** Would a real industry expert write this exact sentence? If no, delete it.`,
            ``,
            `### DECISION FRAMEWORK (Content Angle-Specific)`,
            `- **Comparison/Best-for-X:** Include HTML table mapping scenarios to solutions`,
            `- **News-Update:** Focus on "What Changed", "Why it Matters", "What to do next"`,
            `- **Opinion:** Take clear stance with persuasive arguments`,
            `- **Universal:** Standard educational structure, clear and high-level`,
            ``,
            `### OPERATIONAL REALITIES`,
            `- **Approved Equipment:** ${business.operationalRealities?.equipmentDo.join(', ') || 'Standard industry equipment'}`,
            `- **Forbidden Equipment:** ${business.operationalRealities?.equipmentDoNot.join(', ') || 'None'}`,
            `- **Compliance Stance:** ${brand.complianceStance || 'General'} (Strict = avoid legal promises; General = safety best practices)`,
        ].join('\n');

        return prompt;
    }

    public buildUserPrompt(): string {
        if (!this.post) throw new Error("BlogPost is required to build user prompt.");
        const { keywords, ideas } = this.context;
        const { topic, primaryKeyword, secondaryKeywords, searchIntent, contentAngle, notes } = this.post;

        return `
### ASSIGNMENT
**Topic**: ${topic}
**Primary Keyword**: "${primaryKeyword}" (Focus on Long Tail / High Intent)
**Search Intent**: ${searchIntent}
**Content Angle**: ${contentAngle}

### KEYWORD INSTRUCTIONS
1. **Primary**: Optimize for "${primaryKeyword}".
2. **Secondary**: Naturally integrate: ${secondaryKeywords.join(', ')}.
3. **Supporting/Brand (Context Bank)**: These are general reference keywords. Use with caution. ONLY integrate them if they perfectly align with the specific topic. Do not force them.
4. **Negative (AVOID)**: Do not use or mention: ${keywords.negative.join(', ')}.

### ADDITIONAL NOTES
${notes}

### OUTPUT INSTRUCTIONS
1.  **Metadata Layer**: Start with a JSON block containing the SEO metadata. Format:
    \`\`\`json
    {
      "seoTitle": "...",
      "metaDescription": "..."
    }
    \`\`\`
2.  **Content Layer**: Follow immediately with the full HTML blog post (starting with <style> if needed, then <article>).
3.  Do NOT wrap the HTML in markdown ticks. Just raw HTML after the JSON block.
`.trim();
    }

    public buildImagePrompt(): string {
        if (!this.post) throw new Error("BlogPost is required to build image prompt.");
        const { topic, primaryKeyword, searchIntent } = this.post;
        const { business, brand } = this.context;

        // Construct the scene based on audience
        const isCommercial = searchIntent.toLowerCase().includes('commercial') || business.targetAudience.toLowerCase().includes('manager');
        const setting = isCommercial ? "Industrial property, commercial business park, or large estate" : "Residential garden";

        // Equipment Rules
        const equipment = business.operationalRealities?.equipmentDo.length
            ? `Featured equipment: ${business.operationalRealities.equipmentDo.join(', ')}.`
            : "";

        const negativeConstraints = business.operationalRealities?.equipmentDoNot.length
            ? `DO NOT SHOW: ${business.operationalRealities.equipmentDoNot.join(', ')}.`
            : "No text/overlays.";

        return `Create a high-end, photorealistic featured image for a blog post about: "${topic}".
        
        CONTEXT:
        - Primary Subject: ${primaryKeyword}
        - Setting/Environment: ${setting}
        - Target Audience: ${business.targetAudience}
        - Tone: ${brand.tone} (Professional, Commercial)
        
        VISUAL DETAILS:
        - ${equipment}
        - Style: Cinematic lighting, 8k resolution, highly detailed, professional photography style.
        - Composition: Wide angle, showing scale and capability.
        
        CONSTRAINT:
        - ${negativeConstraints}
        - No text on the image.
        - If the topic suggests heavy work, show heavy professional machinery, not consumer tools.`;
    }

    public buildIdeaGenerationSystemPrompt(count: number, goal: string, keywordStrategy: 'long-tail' | 'mix'): string {
        const { business, brand, domainInfo, keywords } = this.context;

        return `
You are an expert Content Strategist for "${domainInfo.titles[0] || 'the client'}".
Your goal is to brainstorm ${count} high-impact blog post ideas that directly support the business goal.

### BUSINESS CONTEXT
- **Services**: ${business.services?.join(', ') || 'N/A'}
- **Audience**: ${business.targetAudience}
- **Pain Points**: ${business.painPoints.join(', ')}
- **Target Locations**: ${business.locations && business.locations.length > 0 ? business.locations.join(', ') : "Global/National"}
- **Operational Reality**: ${business.operationalRealities?.methods.join(', ') || 'Standard'}

### STRATEGIC GOAL
"${goal}"

### RULES (Strict Relevancy)
1.  **Bridge Content**: Every idea must bridge a user pain point to a business solution (Service).
2.  **SCU (Search Consensus/User) Relevancy**:
    -   Do NOT suggest generic "What is X" articles unless it's a novel angle.
    -   Focus on "Problem -> Solution" or "Commercial Investigation" (Best X for Y).
    -   Focus on "Problem -> Solution" or "Commercial Investigation" (Best X for Y).
    -   Ensure ideas are actually viable for a blog post (informative, helpful).
    -   **Localization**: If "Target Locations" are specific (e.g. cities/regions), ensure at least 30% of ideas explicitly target those locations in the topic or keyword.
3.  **Deduplication**:
    -   Existing Content: ${domainInfo.urls.join(', ').slice(0, 500)}...
    -   DO NOT suggest topics that are substantially similar to existing pages.
4.  **Keyword Strategy**: ${keywordStrategy === 'long-tail' ? 'Focus strictly on specific, low-competition, long-tail queries.' : 'Mix head terms and long-tail specific queries.'}

### OUTPUT FORMAT (JSON ONLY)
Return a valid JSON object containing an "ideas" array.
{
  "ideas": [
    {
      "topic": "Title of the post",
      "primaryKeyword": "the main seo keyword",
      "searchIntent": "Informational | Commercial | Transactional",
      "contentAngle": "How-to | Comparison | Best-for-X | Mistakes | Cost",
      "rationale": "Brief reason why this hits the pain point"
    }
  ]
}
`.trim();
    }

    public buildMetadataDetectionPrompt(topic: string): string {
        return `
You are an SEO Expert. Analyze the following blog post topic and return the most likely Search Intent and Content Angle.

### TOPIC
"${topic}"

### DEFINITIONS
- **Search Intent**: Informational (educate), Commercial (investigate products/services), Transactional (ready to buy), Navigational (find page).
- **Content Angle**: How-to (guide), Comparison (vs), Best-for-X (listicle/ranking), Alternatives (options), Cost (pricing/economics), Mistakes (what not to do).

### OUTPUT FORMAT (JSON ONLY)
Return a valid JSON object.
{
  "searchIntent": "...",
  "contentAngle": "..."
}
`.trim();
    }

    /**
     * Smart CTA Fallback Logic
     * If user hasn't set a custom CTA link, automatically find /contact, /get-in-touch, or /enquire from sitemap
     */
    private getFallbackCtaLink(): string {
        const { seoRules, domainInfo } = this.context;

        // 1. If user manually set a CTA link, use it
        if (seoRules.ctaLink && seoRules.ctaLink.trim() !== '') {
            return seoRules.ctaLink;
        }

        // 2. Otherwise, intelligently find contact page from sitemap URLs
        const contactPatterns = [
            '/contact',
            '/get-in-touch',
            '/enquire',
            '/enquiry',
            '/request-quote',
            '/book',
            '/schedule'
        ];

        for (const pattern of contactPatterns) {
            const found = domainInfo.urls.find(url =>
                url.toLowerCase().includes(pattern)
            );
            if (found) return found;
        }

        // 3. Final fallback - use generic /contact
        return '/contact';
    }
}
