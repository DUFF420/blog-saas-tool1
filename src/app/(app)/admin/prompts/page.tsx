'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Code, BarChart } from "lucide-react";
import { getPromptPreviewAction } from '@/actions/prompt-preview';
import { useProject } from '@/context/project-context';

interface PromptPreview {
    systemPrompt: string;
    userPrompt: string;
    systemTokens: number;
    userTokens: number;
    totalTokens: number;
    projectName: string;
    brandColor: string;
    hasReferenceHtml: boolean;
}

export default function PromptPreviewPage() {
    const { projects, activeProject, isLoading: projectLoading } = useProject();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [testTopic, setTestTopic] = useState('Best Equipment for Commercial Grounds Clearance');
    const [testKeyword, setTestKeyword] = useState('commercial grounds clearance');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<PromptPreview | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Set the active project as default when available
    useEffect(() => {
        if (activeProject && !selectedProjectId) {
            setSelectedProjectId(activeProject.id);
        }
    }, [activeProject, selectedProjectId]);

    const handlePreview = async () => {
        if (!selectedProjectId || !testTopic || !testKeyword) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError(null);

        const result = await getPromptPreviewAction(selectedProjectId, testTopic, testKeyword);

        if (result.success && result.data) {
            setPreview(result.data);
        } else {
            setError(result.error || "Failed to generate preview");
        }

        setLoading(false);
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">System Prompt Viewer</h1>
                <p className="text-muted-foreground mt-2">
                    Debug and inspect the exact prompts sent to OpenAI during blog generation
                </p>
            </div>

            {/* Input Form */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Generate Prompt Preview</CardTitle>
                    <CardDescription>
                        Select a project and enter test values to see the prompts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="project">Project</Label>
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={projectLoading}>
                            <SelectTrigger id="project">
                                <SelectValue placeholder={projectLoading ? "Loading projects..." : "Select a project"} />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="topic">Test Topic</Label>
                        <Input
                            id="topic"
                            value={testTopic}
                            onChange={(e) => setTestTopic(e.target.value)}
                            placeholder="e.g., Best Equipment for Commercial Grounds Clearance"
                        />
                    </div>

                    <div>
                        <Label htmlFor="keyword">Primary Keyword</Label>
                        <Input
                            id="keyword"
                            value={testKeyword}
                            onChange={(e) => setTestKeyword(e.target.value)}
                            placeholder="e.g., commercial grounds clearance"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button onClick={handlePreview} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Eye className="mr-2 h-4 w-4" />
                        {loading ? 'Generating...' : 'Preview Prompts'}
                    </Button>
                </CardContent>
            </Card>

            {/* Prompt Preview */}
            {preview && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Project</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{preview.projectName}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{preview.totalTokens.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    ~${(preview.totalTokens * 0.00001).toFixed(4)} cost
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Brand Color</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-md border"
                                        style={{ backgroundColor: preview.brandColor }}
                                    />
                                    <span className="font-mono text-sm">{preview.brandColor}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Reference HTML</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant={preview.hasReferenceHtml ? "default" : "secondary"}>
                                    {preview.hasReferenceHtml ? 'Provided' : 'Fallback'}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Prompt Content */}
                    <Tabs defaultValue="system" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="system">
                                <Code className="mr-2 h-4 w-4" />
                                System Prompt ({preview.systemTokens.toLocaleString()} tokens)
                            </TabsTrigger>
                            <TabsTrigger value="user">
                                <Code className="mr-2 h-4 w-4" />
                                User Prompt ({preview.userTokens.toLocaleString()} tokens)
                            </TabsTrigger>
                            <TabsTrigger value="breakdown">
                                <BarChart className="mr-2 h-4 w-4" />
                                Structure Breakdown
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="system" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">System Prompt</CardTitle>
                                    <CardDescription>
                                        Base layer instructions defining HTML structure, SEO rules, and brand guidelines
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-[600px] overflow-y-auto">
                                        <code>{preview.systemPrompt}</code>
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="user" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">User Prompt</CardTitle>
                                    <CardDescription>
                                        Project-specific layer with topic, keywords, and content angle
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-[600px] overflow-y-auto">
                                        <code>{preview.userPrompt}</code>
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="breakdown" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Prompt Structure Analysis</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">System Prompt Sections:</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                            <li>🚨 HTML Output Mandate (enforces HTML structure)</li>
                                            <li>📋 HTML/CSS Styling Template (Context Vault reference)</li>
                                            <li>🎯 Target Audience & Business Goals</li>
                                            <li>🎨 Brand Voice & Tone</li>
                                            <li>📝 Content Structure & SEO Rules</li>
                                            <li>⚠️ Quality Rules (Anti-Fluff Directive)</li>
                                            <li>⚙️ Operational Realities (Equipment Do's & Don'ts)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">User Prompt Sections:</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                            <li>Topic Assignment</li>
                                            <li>Primary & Secondary Keywords</li>
                                            <li>Search Intent & Content Angle</li>
                                            <li>Output Format Instructions (JSON + HTML)</li>
                                        </ul>
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                        <h3 className="font-semibold mb-2 text-blue-900">Two-Layer Architecture Confirmed</h3>
                                        <p className="text-sm text-blue-700">
                                            <strong>Layer 1 (System):</strong> Universal rules for HTML structure, SEO best practices, and professional writing standards.<br />
                                            <strong>Layer 2 (User):</strong> Project-specific context including brand styling, keywords, and topic details.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}
