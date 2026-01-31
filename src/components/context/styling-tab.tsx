import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface StylingTabProps {
    data: ProjectContext['styling'] | undefined; // Handle optional/undefined
    onChange: (data: ProjectContext['styling']) => void;
}

export function StylingTab({ data, onChange }: StylingTabProps) {
    // Default to empty object if undefined (migration safety)
    const safeData = data || { referenceHtml: '' };

    const updateField = (field: keyof ProjectContext['styling'], value: string) => {
        onChange({ ...safeData, [field]: value });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>HTML/CSS Styling Reference</CardTitle>
                    <CardDescription>
                        Provide a single &quot;gold standard&quot; HTML snippet. The generator will use this as a direct template.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Reference HTML (with Integrated CSS)</Label>
                        <p className="text-xs text-slate-500">
                            Paste your full HTML block here. <strong>Include all necessary CSS within `&lt;style&gt;` tags or use utility classes (like Tailwind) directly.</strong> There is no separate CSS file.
                        </p>
                        <Textarea
                            value={safeData.referenceHtml}
                            onChange={(e) => updateField('referenceHtml', e.target.value)}
                            placeholder="<style> .my-post { color: red; } </style>
<article class='my-post'>
  <h1>Example Title</h1>
  ..."
                            className="font-mono text-xs min-h-[400px]"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
