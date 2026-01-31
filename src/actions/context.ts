'use server';

import { ProjectContext } from '@/types';

// Real implementation using Cheerio and OpenAI
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

async function scrapeWebsite(url: string): Promise<{ text: string, links: string[] }> {
    try {
        console.log(`Scraping ${url}...`);
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlogOSBot/1.0)' }
        });
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        const html = await res.text();
        const $ = cheerio.load(html);

        // Extract Links BEFORE cleaning the DOM
        const links: Set<string> = new Set();
        const baseUrl = new URL(url);

        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                try {
                    // Resolve relative URLs
                    const absoluteUrl = new URL(href, baseUrl.href);
                    // Only keep internal links
                    if (absoluteUrl.hostname === baseUrl.hostname) {
                        // Store relative path or full? Let's store full for now, or relative for cleaner context.
                        // PromptBuilder uses them for "Known Pages". Paths are good.
                        links.add(absoluteUrl.pathname);
                    }
                } catch (e) {
                    // Ignore invalid URLs
                }
            }
        });

        // Remove scripts, styles, and SVG to reduce noise for text analysis
        $('script').remove();
        $('style').remove();
        $('svg').remove();
        $('nav').remove();
        $('footer').remove();

        const text = $('body').text().replace(/\s+/g, ' ').trim();

        return {
            text: text.substring(0, 15000),
            links: Array.from(links).filter(l => l.length > 1 && !l.includes('.')) // Basic filter for assets
        };
    } catch (e) {
        console.error("Scrape failed", e);
        return { text: "", links: [] };
    }
}

async function analyzeWithAI(content: string, currentContext: ProjectContext): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
        return `[SIMULATION MODE] API Key missing. \n\nScraped content length: ${content.length} chars.\n\nTo activate real AI, add OPENAI_API_KEY to .env.local file.`;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log("Analyzing with OpenAI...");

    const systemPrompt = `You are a Brand Strategist and SEO Auditor. 
Your task is to analyze the raw homepage content of a business and the user's initial input.
You must synthesize a "Global Project Context" - a comprehensive "source of truth" document that describes the business, brand, and goals.
This context will be used by other AI agents to write blog posts.

Output only the synthesized Global Context text (Markdown format). 
Do not output JSON.`;

    const userPrompt = `
HOMEPLACE CONTENT (RAW):
${content.substring(0, 5000)}

USER INPUTS:
- Audience: ${currentContext.business.targetAudience}
- Services: ${currentContext.business.services.join(', ')}
- Tone: ${currentContext.brand.tone}

INSTRUCTIONS:
Write a detailed "Global Context" (approx 300-500 words).
Include sections:
1. Business Overview & Mission
2. Core Value Proposition
3. Target Audience & Pain Points (Refined)
4. Brand Voice Guidelines
5. Primary Services Breakdown
`;

    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview", // or gpt-3.5-turbo if preferred
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
    });

    return response.choices[0].message.content || "";
}

export async function generateSmartContextAction(projectId: string, domain: string, currentContext: ProjectContext) {
    try {
        const url = domain.startsWith('http') ? domain : `https://${domain}`;
        const { text, links } = await scrapeWebsite(url);

        if (!text) {
            return { success: false, error: "Failed to scrape website. Check domain or try again." };
        }

        const globalContext = await analyzeWithAI(text, currentContext);

        const newContext: ProjectContext = {
            ...currentContext,
            globalContext,
            domainInfo: {
                ...currentContext.domainInfo,
                urls: links.slice(0, 100), // Limit to avoid massive payloads
                lastSitemapFetch: new Date().toISOString()
            }
        };

        return { success: true, data: newContext };

    } catch (error) {
        console.error("Smart Context Error:", error);
        return { success: false, error: "Failed to generate smart context." };
    }
}
