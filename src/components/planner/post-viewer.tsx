'use client';

import { BlogPost } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Copy, Check, FileText, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPostContent } from '@/actions/planner';
import { markPostAsViewed } from '@/actions/posts';
import DOMPurify from 'isomorphic-dompurify';

export function PostViewer({ post }: { post: BlogPost }) {
    const router = useRouter();
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Metadata Copy State
    const [copiedTitle, setCopiedTitle] = useState(false);
    const [copiedDesc, setCopiedDesc] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const copyText = (text: string, setter: (v: boolean) => void) => {
        navigator.clipboard.writeText(text || '');
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    useEffect(() => {
        const loadContent = async () => {
            if (post.contentPath) {
                const text = await getPostContent(post.projectId, post.contentPath);
                setContent(text || '');
            }
            setIsLoading(false);
        };
        loadContent();

        // Phase 34: Mark post as viewed when opened
        markPostAsViewed(post.id);
    }, [post.contentPath, post.id]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 container mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{post.seoTitle || post.topic}</h1>
                    <p className="text-sm text-slate-500">Status: {post.status} • Keyword: {post.primaryKeyword}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    {/* Actions moved or removed */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Preview */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Content Preview</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleCopy}>
                                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                {copied ? 'Copied HTML' : 'Copy HTML'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-64 flex items-center justify-center text-slate-400">Loading content...</div>
                            ) : (
                                <div className="prose max-w-none p-4 rounded-md border bg-white min-h-[500px]">
                                    {/* Render HTML safely? For now, raw or iframe */}
                                    {content ? (
                                        <div
                                            className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-inherit prose-a:font-semibold prose-a:underline hover:prose-a:opacity-80 [&_a]:!text-inherit [&_a]:!font-semibold"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(content
                                                    // SECURITY FIX: Force external links to open in new tab to prevent iframe hijacking
                                                    .replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g, (match, quote, url) => {
                                                        // Don't modify anchor links (internal page jumps)
                                                        if (url.startsWith('#')) return match;
                                                        // Add target="_blank" and rel="noopener noreferrer"
                                                        // First check if target already exists to avoid duplication
                                                        if (match.includes('target=')) return match.replace(/target=["'][^"']*["']/, 'target="_blank" rel="noopener noreferrer"');
                                                        return `<a href="${url}" target="_blank" rel="noopener noreferrer"`;
                                                    }), { ADD_TAGS: ['style', 'iframe', 'div', 'span', 'h2', 'h3', 'h4', 'ul', 'li', 'p', 'strong', 'em', 'br', 'hr', 'a', 'img', 'blockquote', 'table', 'tbody', 'tr', 'td', 'th', 'thead'], ADD_ATTR: ['target', 'rel', 'style', 'class', 'id', 'width', 'height', 'src', 'alt', 'title'] }) // Allow target="_blank"
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center py-20 text-slate-400">
                                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                            No content generated yet.
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Metadata */}
                <div className="space-y-6">
                    {/* Image Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Featured Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md border bg-slate-50 overflow-hidden aspect-video relative flex items-center justify-center">
                                {/* Use next/image or standard img for local files */}
                                <img
                                    src={post.imagePath || '/placeholder-image.png'}
                                    alt="Generated Blog Post Image"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <Button className="w-full" variant="outline" onClick={() => {
                                const link = document.createElement('a');
                                link.href = post.imagePath || '/placeholder-image.png';
                                link.download = `${post.primaryKeyword.replace(/\s+/g, '-')}.webp`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}>
                                <Download className="mr-2 h-4 w-4" /> Download WebP
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-slate-700">SEO Title</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyText(post.seoTitle || '', setCopiedTitle)}>
                                        {copiedTitle ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                                    </Button>
                                </div>
                                <p className="text-slate-600 bg-slate-50 p-2 rounded">{post.seoTitle || '-'}</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-slate-700">Meta Description</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyText(post.metaDescription || '', setCopiedDesc)}>
                                        {copiedDesc ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                                    </Button>
                                </div>
                                <p className="text-slate-600 bg-slate-50 p-2 rounded">{post.metaDescription || '-'}</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-slate-700">Primary Keyword</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyText(post.primaryKeyword || '', setCopiedKey)}>
                                        {copiedKey ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                                    </Button>
                                </div>
                                <p className="text-slate-600 bg-slate-50 p-2 rounded">{post.primaryKeyword}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
