import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

import { fetchSitemap } from '@/actions/project';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

// ... existing imports

interface DomainTabProps {
    data: ProjectContext['domainInfo'];
    onChange: (data: ProjectContext['domainInfo']) => void;
}

export function DomainTab({ data, onChange }: DomainTabProps) {
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (field: keyof ProjectContext['domainInfo'], value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleFetchSitemap = async () => {
        if (!data.sitemapUrl) return;
        setIsLoading(true);
        try {
            const result = await fetchSitemap(data.sitemapUrl);
            if (result.success && result.urls) {
                // Merge unique URLs (using Set for deduplication)
                const combinedUrls = [...data.urls, ...result.urls];
                const uniqueUrls = Array.from(new Set(combinedUrls.filter(u => u && u.trim() !== '')));

                onChange({
                    ...data,
                    urls: uniqueUrls,
                    lastSitemapFetch: new Date().toISOString()
                });
            } else {
                alert('Failed to fetch sitemap. Check URL.');
            }
        } catch (e) {
            alert('Error fetching sitemap');
        } finally {
            setIsLoading(false);
        }
    };

    const addUrl = () => {
        onChange({ ...data, urls: [...data.urls, ''] });
    };

    const updateUrl = (index: number, value: string) => {
        const newUrls = [...data.urls];
        newUrls[index] = value;
        onChange({ ...data, urls: newUrls });
    };

    const removeUrl = (index: number) => {
        const newUrls = [...data.urls];
        newUrls.splice(index, 1);
        onChange({ ...data, urls: newUrls });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Domain & URLs</CardTitle>
                    <CardDescription>Configure the main domain and pages to analyze.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Sitemap URL (XML)</Label>
                        <div className="flex gap-2">
                            <Input
                                value={data?.sitemapUrl || ''}
                                onChange={(e) => updateField('sitemapUrl', e.target.value)}
                                placeholder="https://example.com/sitemap.xml"
                            />
                            <Button onClick={handleFetchSitemap} disabled={isLoading || !data?.sitemapUrl}>
                                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Fetch'}
                            </Button>
                        </div>
                        {data?.lastSitemapFetch && (
                            <p className="text-xs text-slate-400">
                                Last updated: {new Date(data.lastSitemapFetch).toLocaleString()} ({data.urls?.length || 0} URLs)
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Known Page URLs</Label>
                            <Button variant="outline" size="sm" onClick={addUrl}><Plus className="h-4 w-4 mr-2" /> Add URL</Button>
                        </div>
                        {data?.urls?.map((url, i) => (
                            <div key={i} className="flex gap-2">
                                <Input
                                    value={url}
                                    onChange={(e) => updateUrl(i, e.target.value)}
                                    placeholder="https://example.com/page"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeUrl(i)}>
                                    <Trash2 className="h-4 w-4 text-slate-500" />
                                </Button>
                            </div>
                        ))}
                        {(!data?.urls || data.urls.length === 0) && <p className="text-sm text-slate-500 italic">No URLs added.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
