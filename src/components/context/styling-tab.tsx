import { useRef, useState, useEffect } from 'react';
import { ProjectContext } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HelpCircle, Eye, Code, ExternalLink } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface StylingTabProps {
    data: ProjectContext['styling'] | undefined;
    onChange: (data: ProjectContext['styling']) => void;
}

export function StylingTab({ data, onChange }: StylingTabProps) {
    const safeData: ProjectContext['styling'] = data || { referenceHtml: '' };
    const colorInputRef = useRef<HTMLInputElement>(null);

    const updateField = (field: keyof ProjectContext['styling'], value: string) => {
        onChange({ ...safeData, [field]: value });
    };

    // Live Preview Iframe Doc
    const previewDoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; box-sizing: border-box; }
                    /* User Custom CSS */
                    ${safeData.customCss || ''}
                </style>
                <script>
                    document.addEventListener('click', function(e) {
                        const link = e.target.closest('a');
                        if (link) {
                            e.preventDefault();
                            console.log('Navigation prevented in preview mode');
                            return false;
                        }
                    }, true);
                </script>
            </head>
            <body>
                ${safeData.customHtml || '<div style="color: #64748b; font-size: 14px; text-align: center; margin-top: 40px;">Preview area waiting for code...</div>'}
            </body>
        </html>
    `;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Global Brand Color Section */}
            <Card className="border-l-4 border-l-indigo-500 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Brand Identity
                    </CardTitle>
                    <CardDescription>Define the core visual elements for your brand.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Label>Primary Brand Color</Label>
                        <div className="flex gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="relative group">
                                <div
                                    className="w-16 h-16 rounded-xl border-2 border-white shadow-md cursor-pointer transition-transform group-hover:scale-105"
                                    style={{ backgroundColor: safeData.brandColor || '#24442c' }}
                                    onClick={() => colorInputRef.current?.click()}
                                />
                                <input
                                    ref={colorInputRef}
                                    type="color"
                                    value={safeData.brandColor || '#24442c'}
                                    onChange={(e) => updateField('brandColor', e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Input
                                    type="text"
                                    value={safeData.brandColor || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || /^#[0-9A-Fa-f]{0,6}$/.test(val)) updateField('brandColor', val);
                                    }}
                                    placeholder="#24442c"
                                    className="font-mono uppercase max-w-[200px]"
                                    maxLength={7}
                                />
                                <p className="text-xs text-slate-500">Used for primary actions, links, and major headings.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Editor Section */}
                <div className="space-y-6">
                    <Card className="h-full flex flex-col shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Code className="w-4 h-4 text-slate-500" />
                                    Component Code
                                </CardTitle>
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-slate-500">
                                                <HelpCircle className="w-4 h-4" />
                                                Need Help?
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs p-4 bg-slate-900 border-slate-800 text-slate-100">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-indigo-300">Tips for Custom Styling</p>
                                                <p className="text-xs leading-relaxed">
                                                    Enter raw HTML elements (like buttons, CTAs) and their corresponding CSS.
                                                    This code serves as a reference for the AI to match your site's look.
                                                </p>
                                                <div className="pt-2 border-t border-slate-700">
                                                    <a
                                                        href="https://www.w3schools.com/css/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                                                    >
                                                        W3Schools CSS Guide <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-0 flex flex-col divide-y divide-slate-100">
                            {/* HTML Input */}
                            <div className="flex-1 p-4 space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-slate-400 font-bold">HTML Structure</Label>
                                <Textarea
                                    value={safeData.customHtml || ''}
                                    onChange={(e) => updateField('customHtml', e.target.value)}
                                    placeholder='<button class="my-cta-btn">Get Started</button>'
                                    className="font-mono text-xs bg-slate-50/50 border-slate-200 min-h-[150px] resize-none focus-visible:ring-indigo-500"
                                />
                            </div>

                            {/* CSS Input */}
                            <div className="flex-1 p-4 space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-slate-400 font-bold">CSS Styles</Label>
                                <Textarea
                                    value={safeData.customCss || ''}
                                    onChange={(e) => updateField('customCss', e.target.value)}
                                    placeholder='.my-cta-btn { background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; }'
                                    className="font-mono text-xs bg-slate-50/50 border-slate-200 min-h-[150px] resize-none focus-visible:ring-pink-500"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Preview Section */}
                <div className="space-y-6">
                    <Card className="h-full flex flex-col shadow-sm border-slate-200 overflow-hidden sticky top-6">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Eye className="w-4 h-4 text-indigo-500" />
                                Live Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 bg-[url('/grid-pattern.svg')] bg-slate-50 relative min-h-[400px]">
                            {/* Iframe for isolated CSS rendering */}
                            <iframe
                                srcDoc={previewDoc}
                                title="Live Preview"
                                className="w-full h-full min-h-[400px] border-0 bg-white shadow-inner"
                                sandbox="allow-scripts"
                            />
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-100/80 backdrop-blur rounded text-[10px] text-slate-500 font-mono border border-slate-200">
                                Isolated Shadow Render
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Legacy Full Reference (Collapsible or Secondary) */}
            <div className="pt-8 border-t border-slate-200">
                <Card className="bg-slate-50 border-dashed border-slate-300">
                    <CardHeader>
                        <CardTitle className="text-sm text-slate-600">Legacy Reference HTML</CardTitle>
                        <CardDescription className="text-xs">Full page HTML reference (Optional)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={safeData.referenceHtml}
                            onChange={(e) => updateField('referenceHtml', e.target.value)}
                            placeholder="Paste full HTML page reference here..."
                            className="font-mono text-xs min-h-[100px] text-slate-500"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
