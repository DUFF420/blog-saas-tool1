'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/context/project-context';
import { getContext, saveContext } from '@/actions/project';
import { ProjectContext } from '@/types';
import { createDefaultContext } from '@/lib/defaults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { DomainTab } from './domain-tab';
import { BrandTab } from './brand-tab';
import { BusinessTab } from './business-tab';
import { SEOTab } from './seo-tab';
import { StylingTab } from './styling-tab';
import { KeywordsTab } from './keywords-tab';
import { IdeasTab } from './ideas-tab';
import { GlobalTab } from './global-tab';
import { SmartContextTab } from './smart-context-tab';

export function ContextView() {
    const { activeProject } = useProject();
    const [context, setContext] = useState<ProjectContext | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!activeProject) return;

        const load = async () => {
            setIsLoading(true);
            try {
                const data = await getContext(activeProject.id);
                setContext(data || createDefaultContext());
            } catch (error) {
                console.error("Failed to load context", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [activeProject]);

    const handleSave = async () => {
        if (!activeProject || !context) return;
        setIsSaving(true);
        try {
            await saveContext(activeProject.id, context);
            // Optional: Toast success
        } catch (error) {
            console.error("Failed to save context", error);
        } finally {
            setIsSaving(false);
        }
    };

    const updateSection = (section: keyof ProjectContext, data: any) => {
        if (!context) return;
        setContext({ ...context, [section]: data });
    };

    if (!activeProject) {
        return <div className="text-center p-8 text-slate-500">Select a project to view context.</div>;
    }

    if (isLoading || !context) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Context Vault</h2>
                    <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
                        Manage the brain of your project. This data trains the AI to understand your brand, audience, and operational rules.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto shadow-md hover:shadow-lg transition-all">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="domain" className="space-y-8">
                {/* Scrollable Tabs Navigation */}
                <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
                    <TabsList className="w-max inline-flex h-11 items-center justify-start rounded-md bg-slate-100 p-1 text-slate-500">
                        <TabsTrigger value="domain" className="px-4">Domain Info</TabsTrigger>
                        <TabsTrigger value="brand" className="px-4">Brand & Voice</TabsTrigger>
                        <TabsTrigger value="business" className="px-4">Business</TabsTrigger>
                        <TabsTrigger value="seo" className="px-4">SEO Rules</TabsTrigger>
                        <TabsTrigger value="styling" className="px-4">HTML / CSS</TabsTrigger>
                        <TabsTrigger value="keywords" className="px-4">Keywords</TabsTrigger>
                        <TabsTrigger value="ideas" className="px-4">Ideas</TabsTrigger>
                        <TabsTrigger value="global" className="px-4">Global Context</TabsTrigger>
                        <TabsTrigger
                            value="smart"
                            className="ml-2 px-4 relative overflow-hidden text-indigo-700 data-[state=active]:bg-white data-[state=active]:text-indigo-800 data-[state=active]:shadow-sm"
                        >
                            <span className="relative z-10 flex items-center gap-1.5 font-semibold">
                                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                Smart Context
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="domain">
                    <DomainTab
                        domain={activeProject.domain}
                        data={context.domainInfo}
                        onChange={(d) => updateSection('domainInfo', d)}
                    />
                </TabsContent>
                <TabsContent value="brand">
                    <BrandTab data={context.brand} onChange={(d) => updateSection('brand', d)} />
                </TabsContent>
                <TabsContent value="business">
                    <BusinessTab data={context.business} onChange={(d) => updateSection('business', d)} />
                </TabsContent>
                {/* Other tabs placeholders */}


                <TabsContent value="seo">
                    <SEOTab data={context.seoRules} onChange={(d) => updateSection('seoRules', d)} />
                </TabsContent>
                <TabsContent value="styling">
                    <StylingTab data={context.styling} onChange={(d) => updateSection('styling', d)} />
                </TabsContent>
                <TabsContent value="keywords">
                    <KeywordsTab data={context.keywords} onChange={(d) => updateSection('keywords', d)} />
                </TabsContent>
                <TabsContent value="ideas">
                    <IdeasTab data={context.ideas} onChange={(d) => updateSection('ideas', d)} />
                </TabsContent>
                <TabsContent value="global">
                    <GlobalTab data={context.globalContext} onChange={(d) => updateSection('globalContext', d)} />
                </TabsContent>
                <TabsContent value="smart">
                    <SmartContextTab
                        context={context}
                        project={activeProject}
                        onUpdateContext={setContext}
                    />
                </TabsContent>

            </Tabs>

            {/* Debug View */}
            {/* <pre className="text-xs bg-slate-100 p-4 rounded overflow-auto h-48">{JSON.stringify(context, null, 2)}</pre> */}
        </div>
    );
}
