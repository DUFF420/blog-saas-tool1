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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Context Vault</h2>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="domain" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="domain">Domain Info</TabsTrigger>
                    <TabsTrigger value="brand">Brand & Voice</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                    <TabsTrigger value="seo">SEO Rules</TabsTrigger>
                    <TabsTrigger value="styling">HTML / CSS</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="ideas">Ideas</TabsTrigger>
                    <TabsTrigger value="global">Global Context</TabsTrigger>
                    <TabsTrigger
                        value="smart"
                        className="relative overflow-hidden text-indigo-600 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 border border-transparent data-[state=active]:border-indigo-200 transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-1">
                            Smart Context
                            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        </span>
                        {/* Animated border effect overlay */}
                        <span className="absolute inset-0 border-2 border-indigo-400 rounded-sm opacity-20 animate-pulse" />
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="domain">
                    <DomainTab data={context.domainInfo} onChange={(d) => updateSection('domainInfo', d)} />
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
