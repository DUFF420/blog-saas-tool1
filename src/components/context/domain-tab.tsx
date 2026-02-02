import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Globe, Loader2, Sparkles, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { fetchSitemap, autoDetectSitemapAction } from '@/actions/project';
import { toast } from 'sonner';
import { getPatternName } from '@/lib/sitemap-detector';

interface DomainTabProps {
    domain: string;
    data: ProjectContext['domainInfo'];
    onChange: (data: ProjectContext['domainInfo']) => void;
}

export function DomainTab({ domain, data, onChange }: DomainTabProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [manualUrl, setManualUrl] = useState('');
    const [copiedDomain, setCopiedDomain] = useState(false);

    // Auto-detection states
    const [detectionInProgress, setDetectionInProgress] = useState(false);
    const [detectionType, setDetectionType] = useState<'posts' | 'pages' | null>(null);
    const [attemptedPatterns, setAttemptedPatterns] = useState<Array<{ url: string; found: boolean }>>([]);
    const [detectedSitemaps, setDetectedSitemaps] = useState<{
        posts?: string;
        pages?: string;
    }>({});

    const updateField = (field: keyof ProjectContext['domainInfo'], value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleCopyDomain = async () => {
        await navigator.clipboard.writeText(domain);
        setCopiedDomain(true);
        setTimeout(() => setCopiedDomain(false), 2000);
    };

    // Manual Fetch Handler
    const handleManualFetch = async () => {
        if (!manualUrl) {
            toast.error('Please enter a sitemap URL');
            return;
        }

        setIsLoading(true);
        try {
            const result = await fetchSitemap(manualUrl, { shallow: false });

            if (result.success && result.urls) {
                // Add URLs to context
                const combined = Array.from(new Set([...data.urls, ...result.urls]));
                onChange({ ...data, urls: combined, lastSitemapFetch: new Date().toISOString() });
                toast.success(`Imported ${result.urls.length} URLs from sitemap`);
                setManualUrl('');
            } else {
                toast.error('Failed to fetch sitemap');
            }
        } catch (error) {
            toast.error('Error fetching sitemap');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-Detect Handler
    const handleAutoDetect = async (type: 'posts' | 'pages') => {
        if (!domain) {
            toast.error('No domain configured for this project');
            return;
        }

        setDetectionInProgress(true);
        setDetectionType(type);
        setAttemptedPatterns([]);

        try {
            const result = await autoDetectSitemapAction(domain, type);

            if (result.success && result.foundUrl) {
                // Success! Update detected sitemaps
                setDetectedSitemaps(prev => ({ ...prev, [type]: result.foundUrl }));
                setAttemptedPatterns(result.attemptedPatterns);
                toast.success(`Found ${type} sitemap: ${result.pattern}`, {
                    description: getPatternName(result.pattern || '')
                });

                // Auto-populate the appropriate field
                if (type === 'posts') {
                    updateField('sitemapUrl', result.foundUrl);
                } else {
                    updateField('pageSitemapUrl', result.foundUrl);
                }
            } else {
                setAttemptedPatterns(result.attemptedPatterns);
                toast.error(`No ${type} sitemap found`, {
                    description: `Tried ${result.attemptedPatterns.length} common patterns`
                });
            }
        } catch (error) {
            toast.error('Auto-detection failed');
        } finally {
            setDetectionInProgress(false);
            setDetectionType(null);
        }
    };

    // Use detected sitemap to fetch URLs
    const handleUseDetectedSitemap = async (type: 'posts' | 'pages') => {
        const url = detectedSitemaps[type];
        if (!url) return;

        setIsLoading(true);
        try {
            const result = await fetchSitemap(url, { shallow: false });

            if (result.success && result.urls) {
                const existingCount = data.urls.length;
                const combined = Array.from(new Set([...data.urls, ...result.urls]));
                const newUrlsAdded = combined.length - existingCount;
                const duplicatesSkipped = result.urls.length - newUrlsAdded;

                // Update with type-specific timestamp
                const timestamp = new Date().toISOString();
                const updates = {
                    ...data,
                    urls: combined,
                    lastSitemapFetch: timestamp,
                    ...(type === 'posts' ? { lastPostSitemapFetch: timestamp } : { lastPageSitemapFetch: timestamp })
                };

                onChange(updates);

                // Detailed toast with deduplication info
                if (duplicatesSkipped > 0) {
                    toast.success(`Added ${newUrlsAdded} new ${type}`, {
                        description: `Skipped ${duplicatesSkipped} duplicate${duplicatesSkipped > 1 ? 's' : ''}`
                    });
                } else {
                    toast.success(`Imported ${newUrlsAdded} ${type} from sitemap`);
                }
            }
        } catch (error) {
            toast.error('Failed to fetch sitemap URLs');
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Hero Card: Primary Domain */}
            <Card className="border-l-4 border-l-indigo-500 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        Primary Domain
                    </CardTitle>
                    <CardDescription>
                        This is the source of truth for your project. All sitemap detections start here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3 items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="p-3 bg-indigo-50 rounded-full">
                            <Globe className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-0.5">Base URL</p>
                            <p className="text-lg font-mono font-semibold text-slate-900 truncate">{domain}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopyDomain}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-500"
                        >
                            {copiedDomain ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. Left Col: Sitemap & Discovery */}
                <div className="space-y-6">
                    <Card className="h-full border-slate-200 shadow-sm flex flex-col">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                Sitemap Discovery
                            </CardTitle>
                            <CardDescription>Automatically find posts and pages.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-6 space-y-6">
                            {/* Smart Detection Buttons */}
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Smart Auto-Detect</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAutoDetect('posts')}
                                        disabled={detectionInProgress}
                                        className="h-auto py-4 flex flex-col gap-2 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                                    >
                                        <div className="p-2 rounded-full bg-slate-100 group-hover:bg-indigo-100 transition-colors">
                                            {detectionInProgress && detectionType === 'posts' ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                            ) : (
                                                <Sparkles className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <span className="font-semibold block text-slate-700 group-hover:text-indigo-700">Find Posts</span>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => handleAutoDetect('pages')}
                                        disabled={detectionInProgress}
                                        className="h-auto py-4 flex flex-col gap-2 hover:border-purple-200 hover:bg-purple-50/50 transition-all group"
                                    >
                                        <div className="p-2 rounded-full bg-slate-100 group-hover:bg-purple-100 transition-colors">
                                            {detectionInProgress && detectionType === 'pages' ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                            ) : (
                                                <Sparkles className="w-4 h-4 text-slate-600 group-hover:text-purple-600" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <span className="font-semibold block text-slate-700 group-hover:text-purple-700">Find Pages</span>
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            {/* Detection Results */}
                            {(detectedSitemaps.posts || detectedSitemaps.pages) && (
                                <div className="bg-green-50/50 border border-green-100 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                                        <CheckCircle2 className="w-4 h-4" /> Detected Sitemaps
                                    </div>
                                    {detectedSitemaps.posts && (
                                        <div className="flex gap-2 items-center bg-white p-2 rounded border border-green-100">
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">Post</Badge>
                                            <span className="text-xs font-mono text-slate-600 truncate flex-1">{detectedSitemaps.posts}</span>
                                            <Button size="sm" variant="ghost" onClick={() => handleUseDetectedSitemap('posts')} className="h-6 text-xs hover:bg-green-50 text-green-700">Import</Button>
                                        </div>
                                    )}
                                    {detectedSitemaps.pages && (
                                        <div className="flex gap-2 items-center bg-white p-2 rounded border border-green-100">
                                            <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">Page</Badge>
                                            <span className="text-xs font-mono text-slate-600 truncate flex-1">{detectedSitemaps.pages}</span>
                                            <Button size="sm" variant="ghost" onClick={() => handleUseDetectedSitemap('pages')} className="h-6 text-xs hover:bg-green-50 text-green-700">Import</Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Manual Fallback */}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Manual Fetch</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={manualUrl}
                                        onChange={(e) => setManualUrl(e.target.value)}
                                        placeholder="https://site.com/sitemap.xml"
                                        className="font-mono text-xs"
                                    />
                                    <Button onClick={handleManualFetch} disabled={isLoading || !manualUrl}>
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Right Col: URL Management */}
                <div className="space-y-6">
                    <Card className="h-full border-slate-200 shadow-sm flex flex-col">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-semibold">Known URLs</CardTitle>
                                <CardDescription>Pages available for context.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={addUrl} className="gap-2">
                                <Plus className="w-3 h-3" /> Add Page
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            {/* URL List */}
                            <div className="max-h-[500px] overflow-y-auto p-2 space-y-1">
                                {data?.urls?.length > 0 ? (
                                    data.urls.map((url, i) => (
                                        <div key={i} className="group flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                            <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                                                <Globe className="w-3 h-3" />
                                            </div>
                                            <Input
                                                value={url}
                                                onChange={(e) => updateUrl(i, e.target.value)}
                                                className="border-0 bg-transparent focus-visible:ring-0 px-0 h-8 font-mono text-xs text-slate-600 focus:bg-white focus:px-2 transition-all w-full"
                                                placeholder="https://..."
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeUrl(i)}
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                                        <div className="p-4 bg-slate-50 rounded-full">
                                            <Globe className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-sm">No URLs imported yet.</p>
                                        <Button variant="link" size="sm" onClick={() => handleAutoDetect('pages')}>Try Auto-Detect</Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        {data?.lastSitemapFetch && (
                            <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-center">
                                Last sync: {new Date(data.lastSitemapFetch).toLocaleDateString()} @ {new Date(data.lastSitemapFetch).toLocaleTimeString()}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
