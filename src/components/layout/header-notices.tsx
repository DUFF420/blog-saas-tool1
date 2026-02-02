'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { submitFeatureRequest } from '@/actions/admin';
import { getMyNotices, dismissNotice } from '@/actions/admin';

interface Notice {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
    created_at: string;
}

export function HeaderNotices() {
    const [open, setOpen] = useState(false);
    const [request, setRequest] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notices, setNotices] = useState<Notice[]>([]);

    // Load notices on mount and poll every 30 seconds
    useEffect(() => {
        loadNotices();
        const interval = setInterval(loadNotices, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    async function loadNotices() {
        const result = await getMyNotices();
        if (result.success && result.notices) {
            setNotices(result.notices);
        }
    }

    async function handleDismiss(noticeId: string) {
        const result = await dismissNotice(noticeId);
        if (result.success) {
            setNotices(notices.filter(n => n.id !== noticeId));
            toast.success('Notice dismissed');
        } else {
            toast.error('Failed to dismiss notice');
        }
    }

    const handleSubmit = async () => {
        if (!request.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await submitFeatureRequest(request, 'header');
            if (result.success) {
                toast.success(result.warning || 'Feature request submitted!');
                setOpen(false);
                setRequest('');
            } else {
                toast.error(result.error || 'Failed to submit');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getNoticeIcon = (type: string) => {
        switch (type) {
            case 'alert':
                return <AlertCircle className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getNoticeVariant = (type: string): 'default' | 'destructive' => {
        return type === 'alert' ? 'destructive' : 'default';
    };

    return (
        <>
            {/* User Notices - Appears at top of page when present */}
            {notices.length > 0 && (
                <div className="mb-4 space-y-2">
                    {notices.map((notice) => (
                        <Alert
                            key={notice.id}
                            variant={getNoticeVariant(notice.type)}
                            className="shadow-md"
                        >
                            {getNoticeIcon(notice.type)}
                            <AlertDescription className="flex items-center justify-between ml-2">
                                <span className="flex-1">{notice.message}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDismiss(notice.id)}
                                    className="ml-4 flex-shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ))}
                </div>
            )}

            {/* Header Actions */}
            <div className="flex items-center gap-4 mr-4">
                {/* BETA NOTICE */}
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="secondary"
                                className="bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-help border-amber-200 px-3 py-1 text-xs"
                            >
                                BETA
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Still in testing. Email me if you find bugs!</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* FEATURE REQUEST */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-2 hidden sm:flex">
                            Request Feature
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Request a Feature</DialogTitle>
                            <DialogDescription>
                                Have an idea? Let me know and I'll see what I can do.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Textarea
                                placeholder="I wish the tool could..."
                                className="h-32 resize-none"
                                value={request}
                                onChange={(e) => setRequest(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting || !request.trim()}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
