'use server';

import { createClerkSupabaseClient } from '@/lib/supabase';
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from 'next/cache';

export async function seedUserData() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const supabase = await createClerkSupabaseClient();

    // ==========================================
    // 1. DB Tree & Garden Services (Authentic Data)
    // ==========================================
    const dbTreeProject = {
        name: "DB Tree & Garden Services (Restored)",
        domain: "https://dbtreeandgarden.co.uk",
        context: {
            domainInfo: {
                urls: [
                    "https://www.dbtreeandgarden.co.uk/",
                    "https://www.dbtreeandgarden.co.uk/privacy-policy/",
                    "https://www.dbtreeandgarden.co.uk/cookie-policy-uk/",
                    "https://www.dbtreeandgarden.co.uk/machine-hire/",
                    "https://www.dbtreeandgarden.co.uk/portfolio/",
                    "https://www.dbtreeandgarden.co.uk/contact/",
                    "https://www.dbtreeandgarden.co.uk/faq/",
                    "https://www.dbtreeandgarden.co.uk/industries-we-serve/",
                    "https://www.dbtreeandgarden.co.uk/about-us/",
                    "https://www.dbtreeandgarden.co.uk/all-services/",
                    "https://www.dbtreeandgarden.co.uk/commercial/",
                    "https://www.dbtreeandgarden.co.uk/large-scale-site-land-clearance/",
                    "https://www.dbtreeandgarden.co.uk/tree-surgery-hedge-work/",
                    "https://www.dbtreeandgarden.co.uk/gardening-service/",
                    "https://www.dbtreeandgarden.co.uk/grounds-maintenance-clearance/",
                    "https://www.dbtreeandgarden.co.uk/blog/"
                ],
                titles: [], // Original data had empty array
                h1s: [],    // Original data had empty array
                services: [], // Original data had empty array
                sitemapUrl: "https://www.dbtreeandgarden.co.uk/post-sitemap.xml", // CORRECTED
                lastSitemapFetch: "2026-01-30T08:10:53.771Z"
            },
            brand: {
                tone: "Tone characteristics:\n\nPlainspoken, no jargon\n\nTrust-led and experienced\n\nLocal and grounded\n\nCommercially credible\n\nReassuring for domestic customers\n\nAvoid salesy language, fluff, or “marketing talk”.",
                writingStyle: "Writing Style Rules\n\nUse short paragraphs and clear headings\n\nWrite in UK English\n\nSpeak directly to the reader (“you”, “your site”, “your property”)\n\nFocus on problems → solutions → outcomes\n\nPrioritise clarity over creativity\n\nInclude subtle CTAs (request a quote, arrange a site visit, call us)\n\nAvoid over-promising or guarantees",
                examples: [],
                doNots: [],
                readingLevel: "Grade 8",
                complianceStance: 'Strict'
            },
            business: {
                services: [
                    "Commercial grounds maintenance",
                    "Large-scale site clearance",
                    "Tree surgery & hedge management",
                    "Machinery hire",
                    "Ongoing maintenance contracts"
                ],
                targetAudience: "Target Audience\n\nPrimary (Commercial focus):\n\nProperty managers\n\nFacilities managers\n\nBusiness parks & industrial estates\n\nSchools, colleges & education sites\n\nCouncils & public sector\n\nDevelopers & construction firms\n\nLandowners & estate managers\n\nSecondary (Domestic support):\n\nHomeowners with large gardens\n\nDomestic tree work & clearance\n\nOne-off or ongoing maintenance",
                painPoints: [
                    "Grounds and trees becoming unsafe or unmanaged",
                    "Struggling to find reliable contractors who turn up",
                    "Needing work completed safely, professionally, and on schedule",
                    "Poor communication from previous contractors",
                    "Overgrown or neglected commercial sites affecting appearance",
                    "Compliance and safety concerns (trees, access, visibility)",
                    "Needing ongoing maintenance rather than one-off jobs"
                ],
                desiredActions: [
                    "Request a site visit",
                    "Get a commercial quote",
                    "Book ongoing maintenance",
                    "Call to discuss requirements",
                    "Submit an enquiry form",
                    "Arrange a one-off or contract job"
                ],
                locations: [
                    "Sunderland",
                    "Washington",
                    "South Shields",
                    "Gateshead",
                    "Newcastle",
                    "Durham",
                    "Boldon",
                    "North East England"
                ],
                operationalRealities: {
                    equipmentDo: [
                        "Stihl MSA 220 C-B (Electric Chainsaws for low noise)",
                        "Timberwolf TW 230 VTR (Tracked Chipper)",
                        "Mercedes Unimog (for difficult terrain)",
                        "Echo Blowers (Low Noise)"
                    ],
                    equipmentDoNot: [
                        "Burning waste on site (We recycle 100% of green waste)",
                        "Loud petrol machinery in residential/school zones (where possible)",
                        "Topping trees (We follow BS3998 standards)"
                    ],
                    methods: [
                        "BS3998 Standard Tree Work",
                        "Risk Assessments provided for every job",
                        "NPTC Certified Staff only"
                    ]
                }
            },
            seoRules: {
                internalLinkDensity: "medium",
                hTagHierarchy: true,
                shortIntro: true,
                scannableLayout: true,
                generateTLDR: true,
                semanticKeywords: true,
                includeImage: true,
                ctaGoal: "Request a Free Quote ", // Note the trailing space from original JSON
                ctaLink: '<a href="https://www.dbtreeandgarden.co.uk/#elementor-action:action=popup:open&settings=popup:1453">'
            },
            styling: {
                referenceHtml: `<style>
  /* ===== DB Blog "Gold Standard" Styling ===== */

  /* Body copy spacing + rhythm */
  .db-blog p { line-height: 1.7; margin-bottom: 1.2em; }

  /* Section headings (H4) + underline accent */
  .db-blog h4 {
    font-size: 22px;
    line-height: 1.4;
    font-weight: 600;
    color: #244e2c;
    margin-top: 2.2em;
    margin-bottom: 0.6em;
    position: relative;
  }
  .db-blog h4::after {
    content: "";
    display: block;
    width: 45px;
    height: 3px;
    background: #2d5a32;
    border-radius: 3px;
    margin-top: 6px;
  }

  /* Lists */
  .db-blog ul { margin: 0 0 1.5em 1.2em; line-height: 1.7; }

  /* Callout / highlight panel */
  .db-blog .callout {
    background: #f4f8f4;
    border-left: 4px solid #2d5a32;
    padding: 16px;
    border-radius: 8px;
    margin: 24px 0;
  }

  /* Images */
  .db-blog img { width: 100%; border-radius: 10px; margin: 25px 0; }

  /* End CTA block */
  .db-blog .cta {
    background: #2d5a32;
    color: #fff;
    padding: 40px 30px;
    border-radius: 10px;
    text-align: center;
    margin-top: 60px;
  }
  .db-blog .cta a {
    display: inline-block;
    margin-top: 14px;
    background: #fff;
    color: #2d5a32;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 600;
  }
</style>

<div class="db-blog">

  <!-- Content title (keep this class name if your theme expects it) -->
  <h2 class="bb-post-title">Example Blog Title Using DB Styling</h2>

  <!-- Intro paragraph -->
  <p>
    This is an example intro paragraph. Use it to set context, mention the service + location naturally, and clearly state the benefit to the reader in plain language.
  </p>

  <!-- Section heading + paragraph -->
  <h4>Example Section Heading</h4>
  <p>
    This is a short section paragraph. Keep sentences clear and practical. Explain what you do, why it matters, and what outcome the reader gets.
  </p>

  <!-- Callout -->
  <div class="callout">
    <strong>Quick takeaway:</strong> Use this callout to highlight the key point, benefit, or “what clients care about most”.
  </div>

  <!-- Optional list -->
  <h4>Example List Section</h4>
  <ul>
    <li><strong>Point one:</strong> short benefit-led line.</li>
    <li><strong>Point two:</strong> short benefit-led line.</li>
    <li><strong>Point three:</strong> short benefit-led line.</li>
  </ul>

  <!-- Optional image (only include if your generator adds images) -->
  <!-- <img src="PASTE_IMAGE_URL_HERE" alt="Describe the image briefly"> -->

  <!-- CTA -->
  <div class="cta">
    <h4 style="color:#fff;margin-top:0;">Ready to Get a Quote?</h4>
    <p>
      Add one short CTA paragraph here. Keep it direct: what they get + what to do next.
    </p>

    <!-- Best practice: full URL + popup action (avoid non-www redirects) -->
    <a href="https://www.dbtreeandgarden.co.uk/#elementor-action:action=popup:open&settings=popup:POPUP_ID">
      Request a Free Quote
    </a>
  </div>

</div>`
            },
            keywords: { target: [], negative: [], clusters: [] },
            ideas: [],
            globalContext: "DB Tree & Garden Services is a North East–based grounds maintenance and tree surgery business with a strong focus on commercial and large-scale work.\n\nThe website and blog content should position the business as:\n\nExperienced and dependable\n\nCommercially capable\n\nLocally trusted\n\nEasy to deal with\n\nSuitable for both contract and one-off work\n\nBlog content should support:\n\nLocal SEO\n\nService authority\n\nTrust and credibility\n\nEnquiry generation (not just traffic)"
        },
        posts: [
            {
                topic: "Top 10 machines to deal with overgrown commercial properties",
                seoTitle: "Ultimate Guide to Commercial grounds clearance in Sunderland (2026 Update)",
                primaryKeyword: "Commercial grounds clearance in Sunderland",
                searchIntent: "Get the user to enquire about a quote for their own property",
                contentAngle: "Comparison",
                status: "trash",
                updatedAt: "2026-01-30T13:01:49.264Z"
            },
            {
                topic: "Best time of year to do a commercial site cleanup",
                seoTitle: "",
                primaryKeyword: "Commercial cleanup",
                searchIntent: "User wants to know the best time to invest in a third-party service to do a big cleanup of their grounds",
                contentAngle: "Comparison",
                status: "trash",
                updatedAt: "2026-01-30T13:12:50.575Z"
            },
            {
                topic: "Best time of year to do a commercial site cleanup",
                seoTitle: "Best Time for Commercial Grounds Clearance in Sunderland",
                primaryKeyword: "Commercial grounds clearance in Sunderland",
                searchIntent: "Get the user to enquire about a quote for their own property",
                contentAngle: "Alternatives",
                status: "trash",
                updatedAt: "2026-01-30T13:12:50.575Z"
            },
            {
                topic: "Industrial Yard Clearance",
                seoTitle: "Expert Guide: Commercial Grounds Clearance in Sunderland",
                primaryKeyword: "Commercial grounds clearance in Sunderland",
                searchIntent: "33",
                contentAngle: "How-to",
                status: "trash",
                generateImage: true,
                updatedAt: "2026-01-30T13:12:50.575Z"
            },
            {
                topic: "Top 10 machines to deal with overgrown commercial properties",
                seoTitle: "Top 10 Machines for Commercial Grounds Clearance in Sunderland",
                primaryKeyword: "Commercial grounds clearance in Sunderland",
                searchIntent: "Get the user to enquire about a quote for their own property",
                contentAngle: "Best-for-X",
                status: "trash",
                generateImage: true,
                updatedAt: "2026-01-30T11:55:07.395Z"
            },
            {
                topic: "Top 10 machines to deal with overgrown commercial properties",
                seoTitle: "Top 10 Machines for Overgrown Commercial Property Clearance in Sunderland",
                primaryKeyword: "Commercial grounds clearance in Sunderland",
                searchIntent: "Get the user to enquire about a quote for their own property",
                contentAngle: "Comparison",
                status: "trash",
                generateImage: true,
                updatedAt: "2026-01-30T13:12:50.575Z"
            },
            {
                topic: "Industrial Yard Clearance",
                seoTitle: "",
                primaryKeyword: "Grounds Maintenance in the North East",
                searchIntent: "Get the user to enquire about a quote for their own property",
                contentAngle: "Cost",
                status: "trash",
                generateImage: true,
                updatedAt: "2026-01-30T13:12:50.575Z"
            },
            {
                topic: "5 Essential Safety Checks for Commercial Grounds: Avoiding Hazards",
                seoTitle: "",
                primaryKeyword: "commercial grounds safety checks",
                searchIntent: "Informational",
                contentAngle: "How-to",
                status: "idea",
                notes: "Addresses the pain point of ensuring commercial sites are safe and compliant, linking the need for professional grounds maintenance.",
                updatedAt: new Date().toISOString()
            },
            {
                topic: "Transforming Your Business Park: The Comprehensive Guide to Site Clearance",
                seoTitle: "",
                primaryKeyword: "business park site clearance guide",
                searchIntent: "Informational",
                contentAngle: "How-to",
                status: "idea",
                notes: "Tackles the problem of overgrown or neglected commercial sites, offering a solution through site clearance services.",
                updatedAt: new Date().toISOString()
            },
            {
                topic: "Why Reliable Contractors Matter: Ensuring Your Grounds Maintenance is On Schedule",
                seoTitle: "",
                primaryKeyword: "reliable grounds maintenance contractors",
                searchIntent: "Commercial",
                contentAngle: "Best-for-X",
                status: "idea",
                notes: "Directly addresses the issue of finding dependable service providers for scheduled maintenance work.",
                updatedAt: new Date().toISOString()
            },
            {
                topic: "The Cost of Neglect: How Untended Commercial Sites Can Impact Your Business",
                seoTitle: "",
                primaryKeyword: "cost of untended commercial sites",
                searchIntent: "Informational",
                contentAngle: "Cost",
                status: "idea",
                notes: "Highlights the consequences of not maintaining commercial properties, leading to a solution through ongoing maintenance contracts.",
                updatedAt: new Date().toISOString()
            },
            {
                topic: "Maximizing Visibility and Safety in Schools: The Role of Professional Tree Surgery",
                seoTitle: "",
                primaryKeyword: "school tree surgery services",
                searchIntent: "Informational",
                contentAngle: "How-to",
                status: "idea",
                notes: "Focuses on the specific needs of schools for safety and visibility, promoting tree surgery as a solution.",
                updatedAt: new Date().toISOString()
            },
            {
                topic: "Navigating Compliance: How Professional Grounds Maintenance Supports Public Sector Needs",
                seoTitle: "Navigating Compliance in the Public Sector: The Essential Role of Professional Grounds Maintenance",
                primaryKeyword: "grounds maintenance for public sector",
                searchIntent: "Commercial",
                contentAngle: "Best-for-X",
                status: "drafted",
                notes: "Addresses compliance and safety concerns in the public sector, showing how ongoing grounds maintenance is a solution.",
                updatedAt: new Date().toISOString()
            },
            {
                topic: "Unlocking the Potential of Your Industrial Estate with Expert Site Clearance",
                seoTitle: "Expert Industrial Estate Site Clearance in the North East",
                primaryKeyword: "industrial estate site clearance",
                searchIntent: "Transactional",
                contentAngle: "Best-for-X",
                status: "saved",
                notes: "Targets industrial estate managers looking to improve their property's appearance and functionality through site clearance.",
                updatedAt: "2026-01-30T13:13:00.097Z"
            },
            {
                topic: "How Often Should Commercial Grounds Be Maintained?",
                seoTitle: "How Often Should Commercial Grounds Be Maintained? | DB Tree & Garden Services",
                primaryKeyword: "how often should commercial grounds be maintained",
                searchIntent: "Informational",
                contentAngle: "How-to",
                status: "drafted",
                updatedAt: "2026-01-30T12:57:26.662Z"
            }
        ]
    };

    // ==========================================
    // 2. Luke Duff (Personal Brand) - Reconstructed
    // ==========================================
    const lukeProject = {
        name: "Luke Duff (Restored)",
        domain: "https://lukeduff.co.uk/",
        context: {
            domainInfo: {
                urls: ["https://lukeduff.co.uk/portfolio", "https://lukeduff.co.uk/blog"],
                titles: ["Luke Duff | SaaS Developer & IT Consultant"],
                h1s: ["Building Digital Products for the Future"],
                services: ["Web Development", "SaaS Consulting"],
                sitemapUrl: "https://lukeduff.co.uk/sitemap.xml",
                lastSitemapFetch: new Date().toISOString()
            },
            business: {
                services: [
                    "Bespoke SaaS Development",
                    "Next.js & React Web Applications",
                    "IT Architecture Consulting",
                    "Technical SEO Audits"
                ],
                targetAudience: "SME Owners and Startups in the UK who need scalable, high-performance digital tools, not just brochure websites.",
                painPoints: [
                    "Slow, bloated WordPress sites that get hacked",
                    "Inability to scale custom software",
                    "Disconnect between marketing and technical teams",
                    "Legacy systems slowing down operations"
                ],
                desiredActions: ["Book a Discovery Call", "View Portfolio"],
                locations: ["Sunderland", "Newcastle", "Remote (UK)", "London"],
                operationalRealities: {
                    equipmentDo: [
                        "Next.js (App Router)",
                        "Supabase / PostgreSQL",
                        "Tailwind CSS",
                        "Vercel Deployment",
                        "TypeScript"
                    ],
                    equipmentDoNot: [
                        "Wordpress (unless Headless)",
                        "Wix / Squarespace",
                        "jQuery",
                        "PHP (Legacy)"
                    ],
                    methods: [
                        "Component-Driven Design",
                        "Server-Side Rendering (SSR)",
                        "Test-Driven Development"
                    ]
                }
            },
            brand: {
                tone: "Visionary, Technical but Accessible, Direct",
                writingStyle: "Punchy, modern tech-focused. Uses data to back up claims.",
                readingLevel: "Grade 11",
                examples: [],
                doNots: ["Don't use jargon without explanation", "Don't sound corporate or stiff"],
                complianceStance: 'Helpful'
            },
            seoRules: {
                internalLinkDensity: "high",
                hTagHierarchy: true,
                shortIntro: true,
                scannableLayout: true,
                generateTLDR: true,
                semanticKeywords: true,
                includeImage: true,
                ctaGoal: "Book Discovery Call",
                ctaLink: "/contact"
            },
            styling: {
                referenceHtml: `<style>
  .tech-post { font-family: 'Inter', sans-serif; color: #1a202c; max-width: 800px; margin: 0 auto; }
  .tech-post h2 { font-weight: 700; font-size: 1.8rem; margin-top: 2.5rem; margin-bottom: 1rem; letter-spacing: -0.025em; }
  .tech-post code { background: #edf2f7; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; color: #d53f8c; }
  .tech-post pre { background: #1a202c; color: #fff; padding: 1.5rem; border-radius: 8px; overflow-x: auto; margin: 1.5rem 0; }
  .tech-post blockquote { border-left: 4px solid #805ad5; padding-left: 1rem; font-style: italic; color: #4a5568; margin: 2rem 0; }
  .cta-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem; border-radius: 12px; text-align: center; margin-top: 4rem; }
  .cta-section h3 { margin-bottom: 1rem; font-size: 1.5rem; }
  .cta-button { background: white; color: #764ba2; font-weight: bold; padding: 1rem 2rem; border-radius: 6px; text-decoration: none; display: inline-block; transition: transform 0.2s; }
  .cta-button:hover { transform: translateY(-2px); }
</style>
<article class="tech-post">
  <h1>Migrating from WordPress to Next.js</h1>
  <p class="lead">Is your headless CMS slowing you down? Here represents the modern stack.</p>

  <h2>Why Performance Matters</h2>
  <p>Google's Core Web Vitals directly impact your SEO ranking.</p>

  <div class="cta-section">
      <h3>Ready to Scale?</h3>
      <p>Let's audit your current architecture.</p>
      <a href="/contact" class="cta-button">Book Discovery Call</a>
  </div>
</article>`
            },
            keywords: {
                target: [
                    "nextjs developer newcastle",
                    "saas development agency uk",
                    "migrate wordpress to nextjs",
                    "react performance optimization",
                    "supabase consultant"
                ],
                negative: [
                    "cheap website design",
                    "wordpress themes",
                    "fiverr freelancer"
                ],
                clusters: []
            },
            ideas: [],
            globalContext: "Luke Duff is a senior full-stack developer specializing in modern web technologies, helping businesses transition from legacy systems to high-performance SaaS platforms."
        },
        posts: [
            { topic: "Why Your Business Should Move from WordPress to Next.js", status: "idea" },
            { topic: "The True Cost of Technical Debt in 2025", status: "idea" },
            { topic: "How Supabase simplifies Backend Development for Startups", status: "idea" }
        ]
    };

    const projectsToSeed = [dbTreeProject, lukeProject];

    for (const p of projectsToSeed) {
        // 1. Create Project
        const { data: project, error: projError } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                name: p.name,
                domain: p.domain
            })
            .select()
            .single();

        if (projError) {
            console.error(`Failed to seed project ${p.name}:`, projError);
            continue;
        }

        // 2. Add Settings
        await supabase
            .from('project_settings')
            .insert({
                project_id: project.id,
                context: p.context
            });

        // 3. Add Posts with full metadata
        const postsWithId = p.posts.map((post: any) => ({
            project_id: project.id,
            topic: post.topic,
            seo_title: post.seoTitle, // Map to snake_case column
            primary_keyword: post.primaryKeyword,
            search_intent: post.searchIntent,
            content_angle: post.contentAngle,
            status: post.status,
            notes: post.notes || '',
            generate_image: post.generateImage || false,
            updated_at: post.updatedAt || new Date().toISOString()
        }));

        const { error: postsError } = await supabase.from('posts').insert(postsWithId);
        if (postsError) console.error("Error seeding posts:", postsError);
    }

    revalidatePath('/');
    return { success: true };
}
