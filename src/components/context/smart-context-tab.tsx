import { useState } from 'react';
import { ProjectContext, Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateSmartContextAction } from '@/actions/context';

interface SmartContextTabProps {
    context: ProjectContext;
    project: Project;
    onUpdateContext: (newContext: ProjectContext) => void;
}

export function SmartContextTab({ context, project, onUpdateContext }: SmartContextTabProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);

    const handleSmartAudit = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            // This action will crawl the site, analyze existing context, and return a "Super Context"
            const response = await generateSmartContextAction(project.id, project.domain, context);

            if (response.success && response.data) {
                onUpdateContext(response.data);
                setResult({ success: true, message: "Context Vault successfully updated with Smart Audit data!" });
            } else {
                setResult({ success: false, message: response.error || "Failed to generate context." });
            }
        } catch (e) {
            console.error(e);
            setResult({ success: false, message: "An unexpected error occurred." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-indigo-100 bg-indigo-50/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Wand2 className="h-6 w-6 text-indigo-600" />
                        <CardTitle className="text-indigo-900">Smart Context Audit</CardTitle>
                    </div>
                    <CardDescription className="text-indigo-700/80">
                        Use AI to audit your live website and synthesize all current settings into a &quot;Master Context&quot;.
                        This will auto-fill missing fields and enhance your Global Context.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 text-sm text-slate-600">
                        <p className="font-medium mb-2 text-indigo-900">What this does:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Crawls your homepage ({project.domain}) to understand current messaging.</li>
                            <li>Analyzes your existing Brand, Business, and SEO settings.</li>
                            <li>Synthesizes a <strong>comprehensive Global Context</strong> "book" for the AI.</li>
                            <li>Auto-suggests improvements to your inputs.</li>
                        </ul>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-md flex items-center gap-2 text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {result.message}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleSmartAudit}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.01]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Auditing & Synthesizing...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Run Smart Audit
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
