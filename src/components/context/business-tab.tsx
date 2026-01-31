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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Business Goals & Conversion</CardTitle>
                    <CardDescription>What are we selling and to whom?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Textarea
                            value={data.targetAudience}
                            onChange={(e) => updateField('targetAudience', e.target.value)}
                            placeholder="Who are the ideal customers?"
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Pain Points (one per line)</Label>
                            <Textarea
                                className="min-h-[200px]"
                                value={data.painPoints?.join('\n') || ''}
                                onChange={(e) => updateField('painPoints', e.target.value.split('\n'))}
                                placeholder="Objection 1&#10;Objection 2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Desired Actions (one per line)</Label>
                            <Textarea
                                className="min-h-[200px]"
                                value={data.desiredActions?.join('\n') || ''}
                                onChange={(e) => updateField('desiredActions', e.target.value.split('\n'))}
                                placeholder="Call for Quote&#10;Book Online"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <Label>Primary Products / Services</Label>
                        <p className="text-xs text-slate-500 mb-2">
                            List the core offerings you want to promote or mentioned as solutions.
                        </p>
                        <Textarea
                            className="h-32"
                            value={data.services?.join('\n') || ''}
                            onChange={(e) => updateField('services', e.target.value.split('\n'))}
                            placeholder="Service A&#10;Product B&#10;Consulting"
                        />
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <Label>Location Targets (Optional)</Label>
                        <p className="text-xs text-slate-500 mb-2">
                            List specific cities, regions, or areas to target for SEO (e.g. &quot;North East England&quot;, &quot;Newcastle&quot;).
                        </p>
                        <Textarea
                            className="h-32"
                            value={data.locations?.join('\n') || ''}
                            onChange={(e) => updateField('locations', e.target.value.split('\n'))}
                            placeholder="London&#10;Manchester&#10;UK-Wide"
                        />
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Operational Realities (Expertise Context)</Label>
                            <p className="text-sm text-slate-500">
                                This data trains the AI on your specific methods and equipment to avoid generic content.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Equipment/Methods: APPROVED (DO USE)</Label>
                                <p className="text-xs text-slate-500">Specific kit or approaches you want mentioned.</p>
                                <Textarea
                                    className="min-h-[150px] font-mono text-xs"
                                    value={data.operationalRealities?.equipmentDo?.join('\n') || ''}
                                    onChange={(e) => {
                                        const currentOp = data.operationalRealities || { equipmentDo: [], equipmentDoNot: [], methods: [] };
                                        const newVal = { ...currentOp, equipmentDo: e.target.value.split('\n') };
                                        updateField('operationalRealities', newVal);
                                    }}
                                    placeholder="Stihl MSA 220 C-B (Electric Chainsaw)\nMEWP for high access\nBio-degradable chain oil"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-red-700">Equipment/Methods: BANNED (DO NOT USE)</Label>
                                <p className="text-xs text-slate-500">Things the AI should NEVER mention or imply.</p>
                                <Textarea
                                    className="min-h-[150px] font-mono text-xs border-red-100"
                                    value={data.operationalRealities?.equipmentDoNot?.join('\n') || ''}
                                    onChange={(e) => {
                                        const currentOp = data.operationalRealities || { equipmentDo: [], equipmentDoNot: [], methods: [] };
                                        const newVal = { ...currentOp, equipmentDoNot: e.target.value.split('\n') };
                                        updateField('operationalRealities', newVal);
                                    }}
                                    placeholder="Petrol blowers (we use electric only)\nFree climbing (we verify harness use)\nGeneric 'garden waste' (we say 'biomass')"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
