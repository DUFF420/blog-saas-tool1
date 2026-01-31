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
        const post = this.post; // Capture for strict null check in closure

        // Filter out current page from potential links to avoid self-linking
        // Simple heuristic: if the URL contains the primary keyword slug, skip it.
        const availableLinks = domainInfo.urls.filter(url =>
            !url.includes(post.primaryKeyword.toLowerCase().replace(/\s+/g, '-'))
        ).slice(0, 50);

        return `
You are an expert SEO Content Writer and Conversion Copywriter for "${domainInfo.titles[0] || 'the client'}".
Your goal is to write a comprehensive, high-ranking, LONG-FORM blog post (Target: 800-1200 words) that strictly adheres to the provided internal guidelines.

### GLOBAL CONTEXT & SOURCE OF TRUTH
${globalContext || 'No global context provided.'}

### TARGET AUDIENCE & BUSINESS GOALS
- **Audience**: ${business.targetAudience}
- **Primary Offerings**: ${business.services?.join(', ') || 'N/A'}
- **Pain Points**: ${business.painPoints.join(', ')}
- **Business Goal**: ${business.desiredActions.join(', ')}
- **Target Locations (GEO)**: ${business.locations?.join(', ') || 'Global/No specific location'}

### BRAND VOICE & TONE
- **Tone**: ${brand.tone}
- **Style**: ${brand.writingStyle}
- **Reading Level**: ${brand.readingLevel}
- **Do NOT**: ${brand.doNots.join(', ')}

### CONTENT STRUCTURE (STRICT)
You must follow this exact flow:
1.  **Strict Focus**: 
    -   **One Intent**: Focus ONLY on the primary intent ("${this.post.searchIntent}"). Do not mix purposes.
    -   **One Format**: Choose ONE main structure (e.g. List, Guide, or Comparison) and stick to it.
2.  **Strong Intro**: Hook the reader immediately. State the problem and the solution. Max 4 sentences.
    -   *Constraint*: You **MUST** naturally include the primary keyword ("${this.post.primaryKeyword}") in the first 2 sentences.
3.  **TL;DR / Key Takeaways**: A bulleted list immediately after the intro summarizing the post.
4.  **Comprehensive Body**: Deep dive into the topic.
    -   **Strict Heading Hierarchy**:
        -   **Main Sections**: Use <h2> for all major sections (e.g., "Benefits", "How To", "Comparison").
        -   **Subsections**: Use <h3> for child points. 
        -   **Detail points**: Use <h4> for deep details if absolutely necessary.
        -   *NEVER* skip levels (e.g. H2 to H4).
    -   *Constraint*: Word count target is 800 - 1200 words. Quality over quantity.
    -   *Constraint*: **Fewer, Stronger Sections**. Prefer 3-4 deep, high-value sections over 10 shallow ones.
    -   *Constraint*: Paragraphs must be short (1-3 sentences).
    -   *Constraint*: **MUST** start with the text introduction, then immediately follow with an <h2>TL;DR</h2> section.
            -   *Content*: The TL;DR summary must naturally include the primary keyword: "${this.post.primaryKeyword}".

6.  **Localization & Service Area (STRICT)**:
    -   You **MUST** mention the target service area(s) or location(s) naturally within the content.
    -   **Target Locations**: ${business.locations && business.locations.length > 0 ? business.locations.join(', ') : "United Kingdom (UK)"}.
    -   If the location is generic (e.g. UK), simply imply national coverage.
    -   If specific locations are provided (e.g. "Sunderland", "North East"), you must reference them in relation to the service to ground the content locally.

4. **Keyword Integration (Strict)**:
    -   **Primary Keyword**: Must appear in the Intro, the TL;DR, and at least one <h2> header.
    -   **Semantic Keywords**: Sprinkle natural variations throughout.
    -   **Example**: "...the right machines make **commercial grounds clearance in Sunderland** faster, safer, and less disruptive..."
    -   Do not force it. Do not repeat it unnaturally.

5. **Internal Linking (Contextual)**:
    -   *Constraint*: Do NOT list links at the bottom.
    -   *Instruction*: You **MUST** weave links naturally *inside* the body paragraphs where relevant.
    -   *Instruction*: Use the exact URL provided. match anchor text to the destination content.
    -   **Available Links**: 
        ${availableLinks.length > 0 ? availableLinks.join('\n        ') : "No specific links provided, link to valid placeholder pages if needed."}

6. **Conclusion & Conversion**:
    - If intent is 'Commercial', enable "Bridge Logic": Transition from information to "Why Hire Us".
    - End with a precise conclusion and soft CTA: "${seoRules.ctaGoal}" pointing to "${seoRules.ctaLink}".

7. **FAQ Section (MANDATORY)**:
    - Add an <h2>Frequently Asked Questions</h2> section at the very bottom.
    - Include 3 high-value questions relevant to the persona (e.g., Cost, Timeframes, Safety).
    - Use Schema.org friendly HTML structure.

### DECISION FRAMEWORK RULES
    - **If Content Angle is "Comparison" or "Best-for-X"**:
        - YOU MUST include a markdown table mapping "Scenario/Problem" to "Recommended Solution/Machine".
    - **If Content Angle is "News-Update"**:
        - Focus on "What Changed", "Why it Matters", and "What to do next".
        - Use a "Key Updates" bullet list at the top.
    - **If Content Angle is "Opinion"**:
        - Take a clear, distinctive stance aligned with the brand tone.
        - Use persuasive arguments and address counter-arguments.
    - **If Content Angle is "Universal"**:
        - Use a standard, broad educational structure. Focus on clarity and high-level understanding.
    - Example Column Headers: "Site Condition", "Recommended Machine", "Why?".

### OPERATIONAL REALITIES (DO'S & DON'TS)
- **Approved Equipment / Methods**: ${business.operationalRealities?.equipmentDo.join(', ') || 'Standard industry equipment'}
- **Strictly FORBIDDEN Equipment / Methods**: ${business.operationalRealities?.equipmentDoNot.join(', ') || 'None'}
- **Compliance Stance**: ${brand.complianceStance || 'General'} (If 'Strict', avoid legal promises. If 'General', focus on safety best practices).

### SEO OPTIMIZATION RULES
- **Primary Keyword**: Must appear in the Intro, and at least one H2 header.
- **Formatting**: Use bolding for key concepts to improve scannability.
- **HTML Structure**: STRICTLY follow H2(Main) -> H3(Sub) -> H4(Detail).

### HTML / CSS TEMPLATE (MUST FOLLOW)
You must output a single valid HTML string that includes embedded CSS in a <style> tag if provided.
Refer to this "Gold Standard" HTML / CSS layout and match its structure / classes exactly:

        \`\`\`html
${styling.referenceHtml || '<!-- No reference HTML provided. Use standard semantic HTML5. -->'}
\`\`\`
`.trim();
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
- **Operational Reality**: ${business.operationalRealities?.methods.join(', ') || 'Standard'}

### STRATEGIC GOAL
"${goal}"

### RULES (Strict Relevancy)
1.  **Bridge Content**: Every idea must bridge a user pain point to a business solution (Service).
2.  **SCU (Search Consensus/User) Relevancy**:
    -   Do NOT suggest generic "What is X" articles unless it's a novel angle.
    -   Focus on "Problem -> Solution" or "Commercial Investigation" (Best X for Y).
    -   Ensure ideas are actually viable for a blog post (informative, helpful).
3.  **Deduplication**:
    -   Existing Content: ${domainInfo.urls.join(', ').slice(0, 500)}...
    -   DO NOT suggest topics that are substantially similar to existing pages.
4.  **Keyword Strategy**: ${keywordStrategy === 'long-tail' ? 'Focus strictly on specific, low-competition, long-tail queries.' : 'Mix head terms and long-tail specific queries.'}

### OUTPUT FORMAT (JSON ONLY)
Return a valid JSON array of objects. No markdown formatting.
[
  {
    "topic": "Title of the post",
    "primaryKeyword": "the main seo keyword",
    "searchIntent": "Informational | Commercial | Transactional",
    "contentAngle": "How-to | Comparison | Best-for-X | Mistakes | Cost",
    "rationale": "Brief reason why this hits the pain point"
  }
]
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
}
