'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PromptBuilder } from '@/lib/generation/prompt-builder';
import { createDefaultContext } from '@/lib/defaults';
import { BlogPost } from '@/types';
import { TechStackVisualizer } from '@/components/settings/tech-stack-visualizer';

// Mock post for the preview
const mockPost: BlogPost = {
    id: 'preview',
    projectId: 'preview',
    topic: 'Example Topic',
    seoTitle: 'Example SEO Title',
    primaryKeyword: 'Example Keyword',
    secondaryKeywords: ['Secondary 1', 'Secondary 2'],
    searchIntent: 'Informational',
    contentAngle: 'How-to',
    targetInternalLinks: [],
    cluster: '',
    priorityScore: 0,
    status: 'idea',
    notes: 'Example notes.',
    generateImage: true,
};

export function SystemPromptsClient() {
    // We instantiate the builder with default context to show the "Raw" template structure
    const builder = new PromptBuilder(createDefaultContext(), mockPost);

    const systemPrompt = builder.buildSystemPrompt();
    const userPrompt = builder.buildUserPrompt();
    const imagePrompt = builder.buildImagePrompt();

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">System Prompt Configuration</h1>
                    <p className="text-slate-500">
                        This is the "Brain" of the blog engine. These are the instructions sent to the AI for every request.
                        Variables like <code>{`\${business.targetAudience}`}</code> are dynamically replaced with data from your Context Vault.
                    </p>
                </div>
                <TechStackVisualizer />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Prompt (The "Rules")</CardTitle>
                    <CardDescription>
                        Defines the persona, voice, strict constraints, and HTML output format.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs whitespace-pre-wrap font-mono">
                        {systemPrompt}
                    </pre>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>User Prompt (The "Assignment")</CardTitle>
                    <CardDescription>
                        The specific task for a single blog post, including topic, keywords, and outline notes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs whitespace-pre-wrap font-mono">
                        {userPrompt}
                    </pre>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Image Generation Prompt (DALL-E 3)</CardTitle>
                    <CardDescription>
                        The prompt used to generate the featured image.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs whitespace-pre-wrap font-mono">
                        {imagePrompt}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
