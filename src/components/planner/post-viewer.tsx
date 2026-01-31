'use client';

import { BlogPost } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Copy, Check, FileText, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPostContent } from '@/actions/planner';

export function PostViewer({ post }: { post: BlogPost }) {
    const router = useRouter();
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadContent = async () => {
            if (post.contentPath) {
                const text = await getPostContent(post.projectId, post.contentPath);
                setContent(text || '');
            }
            setIsLoading(false);
        };
        loadContent();
    }, [post.contentPath]);

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
                    <Button variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy HTML'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Preview */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-64 flex items-center justify-center text-slate-400">Loading content...</div>
                            ) : (
                                <div className="prose max-w-none p-4 rounded-md border bg-white min-h-[500px]">
                                    {/* Render HTML safely? For now, raw or iframe */}
                                    {content ? (
                                        <iframe
                                            srcDoc={content}
                                            className="w-full h-[800px] border-none"
                                            title="Preview"
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
                                <span className="font-semibold block text-slate-700">SEO Title</span>
                                <p className="text-slate-600">{post.seoTitle || '-'}</p>
                            </div>
                            <div>
                                <span className="font-semibold block text-slate-700">Meta Description</span>
                                <p className="text-slate-600">{post.metaDescription || '-'}</p>
                            </div>
                            <div>
                                <span className="font-semibold block text-slate-700">Primary Keyword</span>
                                <p className="text-slate-600">{post.primaryKeyword}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
