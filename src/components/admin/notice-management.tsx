'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertTriangle, Info, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createUserNotice, getAllActiveNotices, deleteUserNotice } from '@/actions/admin';

interface Notice {
    id: string;
    user_id: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
    created_at: string;
    created_by: string;
}

export function NoticeManagement() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'warning' | 'alert'>('info');

    // Load notices on mount
    useEffect(() => {
        loadNotices();
    }, []);

    async function loadNotices() {
        setIsLoading(true);
        const result = await getAllActiveNotices();
        if (result.success) {
            setNotices(result.notices);
        } else {
            toast.error(result.error || 'Failed to load notices');
        }
        setIsLoading(false);
    }

    async function handleCreate() {
        if (!userId || !message) {
            toast.error('User ID and message are required');
            return;
        }

        setIsCreating(true);
        const result = await createUserNotice(userId, message, type);

        if (result.success) {
            toast.success('Notice created successfully');
            setUserId('');
            setMessage('');
            setType('info');
            loadNotices();
        } else {
            toast.error(result.error || 'Failed to create notice');
        }

        setIsCreating(false);
    }

    async function handleDelete(noticeId: string) {
        const result = await deleteUserNotice(noticeId);
        if (result.success) {
            toast.success('Notice deleted');
            loadNotices();
        } else {
            toast.error(result.error || 'Failed to delete notice');
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'alert':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            alert: 'bg-red-100 text-red-700 border-red-200',
            warning: 'bg-amber-100 text-amber-700 border-amber-200',
            info: 'bg-blue-100 text-blue-700 border-blue-200'
        };
        return colors[type as keyof typeof colors] || colors.info;
    };

    return (
        <div className="space-y-6">
            {/* Create Notice Form */}
            <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
                <h3 className="font-semibold text-slate-900">Create New Notice</h3>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">
                            User ID (Clerk ID)
                        </label>
                        <Input
                            placeholder="user_2..."
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Find user IDs in the User Database table above
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">
                            Message
                        </label>
                        <Textarea
                            placeholder="Your important message to the user..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-slate-700 mb-1 block">
                                Type
                            </label>
                            <Select value={type} onValueChange={(val) => setType(val as 'info' | 'warning' | 'alert')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="info">
                                        <div className="flex items-center gap-2">
                                            <Info className="h-4 w-4 text-blue-500" />
                                            Info (Blue)
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="warning">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            Warning (Amber)
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="alert">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            Alert (Red)
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button onClick={handleCreate} disabled={isCreating || !userId || !message}>
                                {isCreating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Create Notice
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Notices List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Active Notices ({notices.length})</h3>
                    <Button variant="ghost" size="sm" onClick={loadNotices} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading notices...
                    </div>
                ) : notices.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                        <Info className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No active notices</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notices.map((notice) => (
                            <div key={notice.id} className="flex items-start gap-3 p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                                {getTypeIcon(notice.type)}

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {notice.user_id.substring(0, 25)}...
                                        </Badge>
                                        <Badge className={getTypeBadge(notice.type)}>
                                            {notice.type.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs text-slate-500">
                                            {new Date(notice.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700">{notice.message}</p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(notice.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
