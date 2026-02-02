import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface BusinessTabProps {
    data: ProjectContext['business'];
    onChange: (data: ProjectContext['business']) => void;
}

export function BusinessTab({ data, onChange }: BusinessTabProps) {
    const updateField = (field: keyof ProjectContext['business'], value: any) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Core Business Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-base font-semibold text-slate-900">Target Audience</CardTitle>
                        <CardDescription>Who are your ideal customers?</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                        <Textarea
                            value={data.targetAudience}
                            onChange={(e) => updateField('targetAudience', e.target.value)}
                            placeholder="e.g. Homeowners in North East England looking for tree surgery..."
                            className="min-h-[120px] resize-none focus-visible:ring-indigo-500"
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-base font-semibold text-slate-900">Core Services</CardTitle>
                        <CardDescription>What do you sell or offer?</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                        <Textarea
                            value={data.services?.join('\n') || ''}
                            onChange={(e) => updateField('services', e.target.value.split('\n'))}
                            placeholder="Service A&#10;Service B&#10;Consulting"
                            className="min-h-[120px] resize-none focus-visible:ring-indigo-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-2 text-right">One service per line</p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Customer Psychology */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Conversion Psychology
                    </CardTitle>
                    <CardDescription>Define the problems you solve and actions you want users to take.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Customer Pain Points</Label>
                            <Textarea
                                className="min-h-[150px] bg-slate-50/50 focus-visible:ring-indigo-500"
                                value={data.painPoints?.join('\n') || ''}
                                onChange={(e) => updateField('painPoints', e.target.value.split('\n'))}
                                placeholder="Worried about cost&#10;Unreliable contractors&#10;Safety concerns"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Desired Actions (CTAs)</Label>
                            <Textarea
                                className="min-h-[150px] bg-slate-50/50 focus-visible:ring-indigo-500"
                                value={data.desiredActions?.join('\n') || ''}
                                onChange={(e) => updateField('desiredActions', e.target.value.split('\n'))}
                                placeholder="Request a Quote&#10;Book Site Visit&#10;Call Now"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Operational Rules */}
            <Card className="shadow-sm border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-900 text-slate-50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Operational Realities
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Train the AI on your specific methods and equipment constraints.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                        {/* APPROVED */}
                        <div className="p-6 bg-green-50/30 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-green-100 rounded-full text-green-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <Label className="text-green-900 font-bold">APPROVED (Do Use)</Label>
                            </div>
                            <p className="text-xs text-slate-500 pb-2">Specific kit or approaches you want mentioned.</p>
                            <Textarea
                                className="min-h-[200px] font-mono text-xs border-green-200 focus-visible:ring-green-500 bg-white"
                                value={data.operationalRealities?.equipmentDo?.join('\n') || ''}
                                onChange={(e) => {
                                    const currentOp = data.operationalRealities || { equipmentDo: [], equipmentDoNot: [], methods: [] };
                                    const newVal = { ...currentOp, equipmentDo: e.target.value.split('\n') };
                                    updateField('operationalRealities', newVal);
                                }}
                                placeholder="Stihl MSA 220 C-B (Electric Chainsaw)&#10;MEWP for high access&#10;Bio-degradable chain oil"
                            />
                        </div>

                        {/* BANNED */}
                        <div className="p-6 bg-red-50/30 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-red-100 rounded-full text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                                </div>
                                <Label className="text-red-900 font-bold">BANNED (Do NOT Use)</Label>
                            </div>
                            <p className="text-xs text-slate-500 pb-2">Things the AI should NEVER mention or imply.</p>
                            <Textarea
                                className="min-h-[200px] font-mono text-xs border-red-200 focus-visible:ring-red-500 bg-white"
                                value={data.operationalRealities?.equipmentDoNot?.join('\n') || ''}
                                onChange={(e) => {
                                    const currentOp = data.operationalRealities || { equipmentDo: [], equipmentDoNot: [], methods: [] };
                                    const newVal = { ...currentOp, equipmentDoNot: e.target.value.split('\n') };
                                    updateField('operationalRealities', newVal);
                                }}
                                placeholder="Petrol blowers&#10;Free climbing (we verify harness use)&#10;Generic 'garden waste'"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-4 border-t border-slate-100">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                    <div className="mt-0.5 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    </div>
                    <div className="text-sm text-blue-900">
                        <span className="font-semibold">Pro Tip:</span> Location targeting has been moved to keywords & SEO rules for better AI context management.
                    </div>
                </div>
            </div>
        </div>
    );
}
