import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface SEOTabProps {
    data: ProjectContext['seoRules'];
    onChange: (data: ProjectContext['seoRules']) => void;
}

export function SEOTab({ data, onChange }: SEOTabProps) {
    const toggle = (field: keyof ProjectContext['seoRules']) => {
        onChange({ ...data, [field]: !data[field] });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>SEO Generation Rules</CardTitle>
                    <CardDescription>Strict rules for the AI generator to follow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="hTag" className="flex flex-col space-y-1">
                            <span>Enforce H-Tag Hierarchy</span>
                            <span className="font-normal text-slate-500 text-xs">Strictly nested H1 &rarr; H2 &rarr; H3 structure</span>
                        </Label>
                        <Switch id="hTag" checked={data?.hTagHierarchy || false} onCheckedChange={() => toggle('hTagHierarchy')} />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="intro" className="flex flex-col space-y-1">
                            <span>Short, Direct Intros</span>
                            <span className="font-normal text-slate-500 text-xs">Avoid fluff. Answer the query immediately.</span>
                        </Label>
                        <Switch id="intro" checked={data?.shortIntro || false} onCheckedChange={() => toggle('shortIntro')} />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="scannable" className="flex flex-col space-y-1">
                            <span>Scannable Layout</span>
                            <span className="font-normal text-slate-500 text-xs">Short paragraphs, bullet points, and bold text.</span>
                        </Label>
                        <Switch id="scannable" checked={data?.scannableLayout || false} onCheckedChange={() => toggle('scannableLayout')} />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="tldr" className="flex flex-col space-y-1">
                            <span>Mandatory TL;DR Block</span>
                            <span className="font-normal text-slate-500 text-xs">3-5 bullet points immediately after intro. Optimized for AI Overviews.</span>
                        </Label>
                        <Switch id="tldr" checked={data?.generateTLDR || false} onCheckedChange={() => toggle('generateTLDR')} />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="semantic" className="flex flex-col space-y-1">
                            <span>Semantic Keywords</span>
                            <span className="font-normal text-slate-500 text-xs">Focus on natural variations over density.</span>
                        </Label>
                        <Switch id="semantic" checked={data?.semanticKeywords || false} onCheckedChange={() => toggle('semanticKeywords')} />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="image" className="flex flex-col space-y-1">
                            <span>Generate Topic Image</span>
                            <span className="font-normal text-slate-500 text-xs">Create one AI image based on the blog topic.</span>
                        </Label>
                        <Switch id="image" checked={data?.includeImage || false} onCheckedChange={() => toggle('includeImage')} />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <Label>Global End-of-Post CTA</Label>
                        <div className="text-xs text-slate-500 mb-2">
                            Define the universal Call-to-Action for all generated posts.
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ctaGoal" className="text-xs font-normal text-slate-500">CTA Goal (What should they do?)</Label>
                            <Input
                                id="ctaGoal"
                                value={data?.ctaGoal || ''}
                                onChange={(e) => onChange({ ...data, ctaGoal: e.target.value })}
                                placeholder="e.g. Book a free consultation"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ctaLink" className="text-xs font-normal text-slate-500">CTA Destination Link</Label>
                            <Input
                                id="ctaLink"
                                value={data?.ctaLink || ''}
                                onChange={(e) => onChange({ ...data, ctaLink: e.target.value })}
                                placeholder="https://"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
