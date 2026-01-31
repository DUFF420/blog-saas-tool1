import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface KeywordsTabProps {
    data: ProjectContext['keywords'];
    onChange: (data: ProjectContext['keywords']) => void;
}

export function KeywordsTab({ data, onChange }: KeywordsTabProps) {
    const updateList = (field: 'target' | 'negative', value: string) => {
        onChange({ ...data, [field]: value.split('\n').filter(s => s.trim()) });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Keyword Bank</CardTitle>
                    <CardDescription>Manage target and negative keywords.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Note on Keyword Usage
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            These are your <strong>Global Context Keywords</strong> (e.g., Brand terms, core services).
                                        </p>
                                        <p className="mt-1">
                                            The AI treats these as a reference library ("a pinch of salt"). <strong>Primary Keywords</strong> are set specifically on each Blog Post in the Planner.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Label>Supporting Keywords (Optional)</Label>
                        <Textarea
                            className="h-48"
                            value={data?.target?.join('\n') || ''}
                            onChange={(e) => updateList('target', e.target.value)}
                            placeholder="brand specific term&#10;secondary niche keyword"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Negative Keywords (one per line)</Label>
                        <Textarea
                            className="h-32"
                            value={data?.negative?.join('\n') || ''}
                            onChange={(e) => updateList('negative', e.target.value)}
                            placeholder="competitor name&#10;cheap&#10;free"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Clusters could be a more complex UI */}
        </div>
    );
}
