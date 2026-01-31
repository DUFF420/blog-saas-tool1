import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BrandTabProps {
    data: ProjectContext['brand'];
    onChange: (data: ProjectContext['brand']) => void;
}

export function BrandTab({ data, onChange }: BrandTabProps) {
    const updateField = (field: keyof ProjectContext['brand'], value: any) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Brand Voice & Tone</CardTitle>
                    <CardDescription>Define how the content should sound.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tone Description</Label>
                        <Textarea
                            className="min-h-[200px]"
                            value={data.tone}
                            onChange={(e) => updateField('tone', e.target.value)}
                            placeholder="e.g. Professional, Authoritative, yet Approachable..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Writing Style Rules</Label>
                        <Textarea
                            className="min-h-[200px]"
                            value={data.writingStyle}
                            onChange={(e) => updateField('writingStyle', e.target.value)}
                            placeholder="e.g. Use active voice. Speak to customers on a human level."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Examples section could go here */}
        </div>
    );
}
