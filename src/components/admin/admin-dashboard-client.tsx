'use client';

import { useEffect, useState } from 'react';
import { getAdminStats, toggleBanUser, grantAccess, getFeatureRequests, toggleFeatureStar, deleteFeatureRequest } from '@/actions/admin';
import { toast } from 'sonner';
import { ShieldAlert, Users, FileText, Ban, CheckCircle, MessageSquare, Star, Trash2, Clock, Globe, Share2, Bell, Copy, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureRequest } from '@/types';
import { NoticeManagement } from './notice-management';

interface AdminDashboardClientProps {
    initialData: Awaited<ReturnType<typeof getAdminStats>>;
    initialRequests: FeatureRequest[];
}

export function AdminDashboardClient({ initialData, initialRequests }: AdminDashboardClientProps) {
    const [data, setData] = useState(initialData);
    const [requests, setRequests] = useState(initialRequests);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'diagnostics'>('users');

    const loadData = async () => {
        try {
            setLoading(true);
            const [stats, reqs] = await Promise.all([
                getAdminStats(),
                getFeatureRequests()
            ]);
            setData(stats);
            setRequests(reqs);
        } catch (e) {
            toast.error("Failed to load Admin Data");
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId: string, current: boolean) => {
        try {
            await toggleBanUser(userId, current);
            toast.success(current ? "User Unbanned" : "User Banned");
            loadData();
        } catch (e) {
            toast.error("Action failed");
        }
    };

    const handleGrant = async (userId: string) => {
        try {
            await grantAccess(userId);
            toast.success("Access Granted");
            loadData();
        } catch (e) {
            toast.error("Action failed");
        }
    };

    const handleStar = async (id: string, current: boolean) => {
        try {
            const res = await toggleFeatureStar(id, current);
            if (res.success) {
                toast.success(current ? "Unstarred" : "Starred as Important");
                loadData();
            }
        } catch (e) {
            toast.error("Failed to star");
        }
    };

    const handleDeleteRequest = async (id: string) => {
        if (!confirm("Delete this request forever?")) return;
        try {
            const res = await deleteFeatureRequest(id);
            if (res.success) {
                toast.success("Request deleted");
                loadData();
            }
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    if (loading && !data) return <div className="p-8 text-center text-slate-500">Loading Alpha Protocol...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Access Denied</div>;

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="text-red-600" />
                    Admin Command Center
                </h1>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all",
                            activeTab === 'users' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        User Database
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === 'requests' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Feature Requests
                        {requests.length > 0 && (
                            <span className="bg-indigo-100 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {requests.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('diagnostics')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === 'diagnostics' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Activity className="w-4 h-4" />
                        Usage & API
                    </button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Total Users</p>
                            <p className="text-2xl font-bold">{data.stats.totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Total Posts</p>
                            <p className="text-2xl font-bold">{data.stats.totalPosts}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Active Projects</p>
                            <p className="text-2xl font-bold">{data.stats.totalProjects}</p>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'users' ? (
                <>
                    {/* USER TABLE */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="font-semibold text-lg">User Database</h2>
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="p-4 font-semibold">User Identity</th>
                                        <th className="p-4 font-semibold">Role</th>
                                        <th className="p-4 font-semibold text-center">Planning</th>
                                        <th className="p-4 font-semibold text-center">Generation</th>
                                        <th className="p-4 font-semibold text-right">Status & Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-5">
                                    {data.users.map((user: any) => (
                                        <tr
                                            key={user.id}
                                            className={`
                                            transition-colors duration-200 
                                            ${user.is_banned ? 'bg-red-50 hover:bg-red-100/80 border-l-4 border-l-red-500' : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'}
                                        `}
                                        >
                                            <td className="p-4">
                                                <div className="font-medium text-slate-900">{user.email || 'No Email'}</div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1 group">
                                                    <span title={user.user_id}>{user.user_id?.substring(0, 12)}...</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(user.user_id);
                                                            toast.success('User ID copied!');
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-200 rounded"
                                                        title="Copy full User ID"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`
                                                inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm border
                                                ${user.role === 'admin'
                                                        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200'
                                                        : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 border-slate-200'}
                                            `}>
                                                    {user.role === 'admin' ? '🔨 Admin' : '👤 Customer'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">
                                                    {user.stats?.totalPlanned || 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold px-2 py-1 rounded text-xs ${user.stats?.totalGenerated > 0 ? 'bg-green-100 text-green-700' : 'text-slate-400'}`}>
                                                    {user.stats?.totalGenerated || 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {user.is_banned ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-1 rounded-md uppercase tracking-wide">
                                                            <Ban className="w-3 h-3" /> Banned
                                                        </span>
                                                    ) : user.has_access ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-md uppercase tracking-wide">
                                                            <CheckCircle className="w-3 h-3" /> Active
                                                        </span>
                                                    ) : (
                                                        <button onClick={() => handleGrant(user.user_id)} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 px-2 py-1 rounded-md uppercase tracking-wide transition-colors">
                                                            Grant Access
                                                        </button>
                                                    )}

                                                    <div className="h-4 w-px bg-slate-200 mx-1"></div>

                                                    <button
                                                        onClick={() => handleBan(user.user_id, user.is_banned)}
                                                        className={`
                                                        p-2 rounded-md transition-all duration-200 shadow-sm border
                                                        ${user.is_banned
                                                                ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-green-600'
                                                                : 'bg-white text-slate-400 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}
                                                    `}
                                                        title={user.is_banned ? "Unban Account" : "Ban Account"}
                                                    >
                                                        {user.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARD LIST */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {data.users.map((user: any) => (
                                <div key={user.id} className={cn("p-4 flex flex-col gap-3", user.is_banned ? "bg-red-50/50" : "")}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-slate-900">{user.email || 'No Email'}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 break-all">
                                                {user.user_id?.substring(0, 18)}...
                                            </div>
                                        </div>
                                        <span className={`
                                            inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm border shrink-0
                                            ${user.role === 'admin'
                                                ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200'
                                                : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 border-slate-200'}
                                        `}>
                                            {user.role === 'admin' ? '🔨 Admin' : '👤 Customer'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-600">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="font-semibold">{user.stats?.totalPlanned || 0}</span> Planned
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                                            <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="font-semibold">{user.stats?.totalGenerated || 0}</span> Generated
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                                        {user.is_banned ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-1.5 rounded-md uppercase tracking-wide">
                                                <Ban className="w-3 h-3" /> Banned
                                            </span>
                                        ) : user.has_access ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1.5 rounded-md uppercase tracking-wide">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <button onClick={() => handleGrant(user.user_id)} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 px-2 py-1.5 rounded-md uppercase tracking-wide transition-colors">
                                                Grant Access
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleBan(user.user_id, user.is_banned)}
                                            className={`
                                            p-2 rounded-md transition-all duration-200 shadow-sm border
                                            ${user.is_banned
                                                    ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-green-600'
                                                    : 'bg-white text-slate-400 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}
                                        `}
                                        >
                                            {user.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* USER NOTICES MANAGEMENT */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Bell className="h-5 w-5 text-indigo-600" />
                                User Notices
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Send notices, warnings, or alerts to specific users</p>
                        </div>
                        <div className="p-6">
                            <NoticeManagement />
                        </div>
                    </div>
                </>
            ) : activeTab === 'requests' ? (
                /* FEATURE REQUESTS */
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    {requests.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center flex flex-col items-center">
                            <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-600">No requests yet</h3>
                            <p className="text-slate-400 max-w-sm mt-2">When users suggest features from the header or coming soon pages, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className={cn(
                                        "bg-white p-6 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md",
                                        request.is_starred ? "border-l-amber-400" : "border-l-slate-200"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                                    {request.email}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1 shadow-sm",
                                                    request.source === 'wordpress' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                        request.source === 'backlinks' ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                                                            "bg-slate-50 text-slate-600 border border-slate-100"
                                                )}>
                                                    {request.source === 'wordpress' && <Globe className="w-2.5 h-2.5" />}
                                                    {request.source === 'backlinks' && <Share2 className="w-2.5 h-2.5" />}
                                                    {!['wordpress', 'backlinks'].includes(request.source) && <ShieldAlert className="w-2.5 h-2.5" />}
                                                    {request.source || 'General'}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(request.created_at))}
                                                </div>
                                            </div>
                                            <p className="text-slate-800 leading-relaxed font-medium">
                                                {request.request}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStar(request.id, request.is_starred)}
                                                className={cn(
                                                    "p-2 rounded-lg border transition-all",
                                                    request.is_starred
                                                        ? "bg-amber-50 text-amber-500 border-amber-200"
                                                        : "bg-white text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-200"
                                                )}
                                                title={request.is_starred ? "Unstar" : "Mark as Important"}
                                            >
                                                <Star className={cn("w-5 h-5", request.is_starred && "fill-amber-400")} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRequest(request.id)}
                                                className="p-2 rounded-lg border bg-white text-slate-400 border-slate-200 hover:text-red-600 hover:border-red-200 transition-all"
                                                title="Delete Request"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* DIAGNOSTICS & USAGE TAB */
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <APIUsageBreakdown />
                </div>
            )}
        </div>
    );
}

import { APIUsageBreakdown } from './api-usage-breakdown';
