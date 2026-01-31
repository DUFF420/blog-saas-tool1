import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface IdeasTabProps {
    data: string[];
    onChange: (data: string[]) => void;
}

export function IdeasTab({ data, onChange }: IdeasTabProps) {
    // Default to empty array if undefined
    const safeData = data || [];

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Split by newlines and filter empty strings
        const lines = e.target.value.split('\n');
        onChange(lines);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Content Ideas & Topics</CardTitle>
                    <CardDescription>
                        A scratchpad for random blog ideas, potential keywords, or broad topics.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Idea Bank (one per line)</Label>
                        <Textarea
                            className="min-h-[400px] font-mono"
                            value={safeData.join('\n')}
                            onChange={handleChange}
                            placeholder="Future of SaaS&#10;How to use AI for SEO&#10;Content marketing trends 2026&#10;..."
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
