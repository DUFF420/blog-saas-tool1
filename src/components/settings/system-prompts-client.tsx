'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PromptBuilder } from '@/lib/generation/prompt-builder';
import { createDefaultContext } from '@/lib/defaults';
import { BlogPost, ProjectContext } from '@/types';
import { TechStackVisualizer } from '@/components/settings/tech-stack-visualizer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock post for the preview
const mockPost: BlogPost = {
    id: 'preview',
    projectId: 'preview',
    topic: 'The Future of AI in SaaS',
    seoTitle: 'Why AI Will Revolutionize SaaS in 2024',
    primaryKeyword: 'AI in SaaS',
    secondaryKeywords: ['Machine Learning', 'Automation', 'Predictive Analytics'],
    searchIntent: 'Commercial Investigation',
    contentAngle: 'Universal',
    targetInternalLinks: [],
    cluster: 'Technology',
    priorityScore: 85,
    status: 'idea',
    notes: 'Focus on enterprise adoption and cost savings.',
    generateImage: true,
};

// RICH MOCK CONTEXT (Simulation)
const richContext: ProjectContext = {
    ...createDefaultContext(),
    domainInfo: {
        ...createDefaultContext().domainInfo,
        titles: ['TechFlow AI'],
        urls: ['https://techflow.ai/pricing', 'https://techflow.ai/features', 'https://techflow.ai/blog/legacy-software'],
    },
    business: {
        services: ['AI-Powered Analytics', 'Automated Reporting', 'Predictive Forecasting'],
        targetAudience: 'CTOs and Data Scientists at Enterprise SaaS companies',
        painPoints: ['Manual data entry errors', 'Slow reporting cycles', 'Lack of actionable insights'],
        desiredActions: ['Book a Demo', 'Start Free Trial'],
        locations: ['San Francisco', 'New York', 'London'],
        operationalRealities: {
            equipmentDo: ['Cloud Dashboards', 'Server Clusters'],
            equipmentDoNot: ['Spreadsheets', 'Paper files'],
            methods: ['Agile', 'Data-First'],
        },
    },
    brand: {
        tone: 'Authoritative yet accessible',
        writingStyle: 'Concise, data-driven, and forward-looking',
        readingLevel: 'Grade 10',
        doNots: ['jargon without explanation', 'passive voice', 'fear-mongering'],
        complianceStance: 'Strict',
        examples: [],
    },
    seoRules: {
        ...createDefaultContext().seoRules,
        ctaGoal: "Drive users to schedule a consultation",
    },
    styling: {
        referenceHtml: "", // Default empty, toggle below controls this
        brandColor: "#6366f1", // Indigo-500
    }
};

export function SystemPromptsClient() {
    const [isRichContext, setIsRichContext] = useState(false);
    const [hasCustomCss, setHasCustomCss] = useState(false);

    // 1. SELECT CONTEXT SOURCE
    let activeContext = isRichContext ? { ...richContext } : createDefaultContext();

    // 2. APPLY SIMULATION OVERRIDES
    if (hasCustomCss) {
        activeContext.styling.referenceHtml = "<!-- Custom CSS Simulation -->\n<style>\n  .h2-custom { font-size: 3rem; color: purple; }\n</style>";
    } else {
        // Ensure it's empty if disabled, even if richContext had some (it doesn't by default but good for safety)
        activeContext.styling.referenceHtml = "";
    }

    // 3. INSTANTIATE BUILDER
    const builder = new PromptBuilder(activeContext, mockPost);

    // 4. GENERATE PROMPTS
    const systemPrompt = builder.buildSystemPrompt();
    const userPrompt = builder.buildUserPrompt();
    const imagePrompt = builder.buildImagePrompt();

    return (
        <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 border-b border-slate-200 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Brain & Logic Viewer</h1>
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded border border-purple-200 uppercase tracking-wide">
                            Admin Access
                        </span>
                    </div>
                    <p className="text-slate-500 max-w-3xl leading-relaxed">
                        Visualize how the "System Brain" constructs directives. Use the simulator to see how
                        <span className="font-semibold text-indigo-600"> Layer 1 (Global Rules)</span> interacts with
                        <span className="font-semibold text-emerald-600"> Layer 2 (Project Data)</span> in real-time.
                    </p>
                </div>

                {/* SIMULATION CONTROLS */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm w-full xl:w-auto">
                    <div className="flex items-center gap-2">
                        <Switch id="rich-mode" checked={isRichContext} onCheckedChange={setIsRichContext} />
                        <Label htmlFor="rich-mode" className="cursor-pointer">
                            <span className="block font-medium text-slate-700">Rich Simulation</span>
                            <span className="block text-xs text-slate-400 font-normal">Injects dummy SaaS data</span>
                        </Label>
                    </div>
                    <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                        <Switch id="css-mode" checked={hasCustomCss} onCheckedChange={setHasCustomCss} />
                        <Label htmlFor="css-mode" className="cursor-pointer">
                            <span className="block font-medium text-slate-700">Has Custom CSS</span>
                            <span className="block text-xs text-slate-400 font-normal">Triggers styling overrides</span>
                        </Label>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="logic" className="w-full">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                    <TabsList className="grid grid-cols-3 w-full lg:w-auto h-auto p-1">
                        <TabsTrigger value="logic">Logic Flow</TabsTrigger>
                        <TabsTrigger value="prompts">Raw Prompts</TabsTrigger>
                        <TabsTrigger value="context">Context Data</TabsTrigger>
                    </TabsList>
                    <div className="w-full lg:w-auto">
                        <TechStackVisualizer />
                    </div>
                </div>

                {/* LOGIC FLOW TAB */}
                <TabsContent value="logic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* FALLBACK LOGIC CARD */}
                        <Card className={`border-l-4 shadow-sm ${!hasCustomCss ? 'border-l-emerald-500 ring-2 ring-emerald-50' : 'border-l-slate-300 opacity-60'}`}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>Fallback Styling Engine</span>
                                    {!hasCustomCss && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>}
                                </CardTitle>
                                <CardDescription>Logic applied when NO custom CSS is provided.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                                        <span><strong>H2 Size:</strong> Enforces <code>26px</code> (Professional SaaS standard)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                                        <span><strong>H3 Size:</strong> Enforces <code>22px</code></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                                        <span><strong>Links:</strong> Enforces <code>inherit color</code>, <code>bold</code>, <code>underlined</code></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                                        <span><strong>Brand Color:</strong> {activeContext.styling.brandColor || '#24442C'} (Applied inline)</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* CUSTOM CSS LOGIC CARD */}
                        <Card className={`border-l-4 shadow-sm ${hasCustomCss ? 'border-l-indigo-500 ring-2 ring-indigo-50' : 'border-l-slate-300 opacity-60'}`}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>Custom Styling Engine</span>
                                    {hasCustomCss && <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Active</Badge>}
                                </CardTitle>
                                <CardDescription>Logic applied when global CSS is DETECTED.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                                        <span><strong>Detection:</strong> Logic detects <code>styling.referenceHtml</code> presence.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                                        <span><strong>Instruction:</strong> Instructs AI to strictly follow provided class names and HTML structure.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                                        <span><strong>Inline Overrides:</strong> Disabled (AI relies on your CSS classes).</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* INTENT LOGIC PREVIEW */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-base">Metadata & Intent Logic</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 bg-slate-900">
                            <code className="text-xs font-mono text-cyan-300 block mb-2">// Logic Input: "{mockPost.topic}"</code>
                            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                                <div>
                                    <span className="text-slate-500">Search Intent:</span> {' '}
                                    <span className="text-yellow-400">{mockPost.searchIntent}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Content Angle:</span> {' '}
                                    <span className="text-yellow-400">{mockPost.contentAngle}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* RAW CONTEXT DATA TAB */}
                <TabsContent value="context">
                    <Card className="shadow-md border-emerald-200 ring-4 ring-emerald-50/50">
                        <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                            <CardTitle className="text-emerald-800">Active Project Context (Layer 2)</CardTitle>
                            <CardDescription>This JSON object is what makes the AI "know" the brand.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 bg-slate-950">
                            <pre className="p-6 overflow-x-auto text-xs leading-relaxed font-mono text-emerald-100/90 whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                                {JSON.stringify(activeContext, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* RAW PROMPTS TAB */}
                <TabsContent value="prompts" className="space-y-6">
                    {/* 1. Master System Prompt */}
                    <Card className="xl:col-span-2 shadow-md border-indigo-200 ring-4 ring-indigo-50/50">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 via-white to-white border-b border-indigo-100 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                        System Prompt (The "Rules")
                                    </CardTitle>
                                    <CardDescription>Defines the persona, voice, strict constraints, and HTML output format.</CardDescription>
                                </div>
                                <div className="px-3 py-1 bg-white border border-indigo-100 rounded text-xs font-mono text-indigo-600 shadow-sm">
                                    role: "system"
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-slate-950">
                            <pre className="p-6 overflow-x-auto text-xs leading-relaxed font-mono text-indigo-100/90 whitespace-pre-wrap max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                {systemPrompt}
                            </pre>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* 2. User Prompt */}
                        <Card className="shadow-sm border-slate-200 flex flex-col">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold">User Prompt (The "Assignment")</CardTitle>
                                    <div className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500">role: "user"</div>
                                </div>
                                <CardDescription>Task specifics (topic, keywords, outline).</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 bg-slate-950 flex-1">
                                <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono text-emerald-100/90 whitespace-pre-wrap h-full max-h-[400px] overflow-y-auto">
                                    {userPrompt}
                                </pre>
                            </CardContent>
                        </Card>

                        {/* 3. Image Prompt */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold">Image Prompt (DALL-E 3)</CardTitle>
                                    <div className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500">Visuals</div>
                                </div>
                                <CardDescription>Used to generate the featured image.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 bg-slate-950">
                                <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono text-pink-100/90 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                    {imagePrompt}
                                </pre>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
