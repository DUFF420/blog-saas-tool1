import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface GlobalTabProps {
    data: string;
    onChange: (data: string) => void;
}

export function GlobalTab({ data, onChange }: GlobalTabProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Global Project Context</CardTitle>
                    <CardDescription>
                        A high-level overview or &quot;source of truth&quot; background for the AI.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>High-Level Context Prompt</Label>
                        <p className="text-xs text-slate-500 mb-2">
                            This serves as background knowledge. The AI will refer to this but prioritizes specific rules and planner details.
                        </p>
                        <Textarea
                            className="min-h-[400px] font-mono"
                            value={data || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="e.g. This company was founded in 1999 with the mission to..."
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
