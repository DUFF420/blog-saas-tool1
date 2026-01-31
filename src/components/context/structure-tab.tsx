import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface StructureTabProps {
    data: ProjectContext['siteStructure'];
    onChange: (data: ProjectContext['siteStructure']) => void;
}

export function StructureTab({ data, onChange }: StructureTabProps) {
    const addLink = () => {
        onChange({
            ...data,
            internalLinks: [...data.internalLinks, { url: '', anchor: '', equity: 5 }]
        });
    };

    const updateLink = (index: number, field: string, value: any) => {
        const newLinks = [...data.internalLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        onChange({ ...data, internalLinks: newLinks });
    };

    const removeLink = (index: number) => {
        const newLinks = [...data.internalLinks];
        newLinks.splice(index, 1);
        onChange({ ...data, internalLinks: newLinks });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Internal Link Bank</CardTitle>
                    <CardDescription>Approved targets for internal linking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Links</Label>
                        <Button variant="outline" size="sm" onClick={addLink}><Plus className="h-4 w-4 mr-2" /> Add Link</Button>
                    </div>

                    <div className="space-y-2">
                        {data.internalLinks.map((link, i) => (
                            <div key={i} className="flex gap-2 items-start p-2 border rounded-md bg-slate-50">
                                <div className="grid gap-2 flex-1">
                                    <Input
                                        placeholder="URL (e.g. /services/cleaning)"
                                        value={link.url}
                                        onChange={(e) => updateLink(i, 'url', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Preferred Anchor Text"
                                        value={link.anchor}
                                        onChange={(e) => updateLink(i, 'anchor', e.target.value)}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeLink(i)} className="mt-1">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        {data.internalLinks.length === 0 && <p className="text-sm text-slate-500 italic">No internal links defined.</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Priority Pages could go here similar to URLs in DomainTab */}
        </div>
    );
}
