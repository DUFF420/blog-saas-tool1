'use client';

import { useEffect, useState } from 'react';
import { getAdminStats, toggleBanUser, grantAccess } from '@/actions/admin';
import { toast } from 'sonner';
import { ShieldAlert, Users, FileText, Ban, CheckCircle } from 'lucide-react';

interface AdminDashboardClientProps {
    initialData: Awaited<ReturnType<typeof getAdminStats>>;
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const stats = await getAdminStats();
            setData(stats);
        } catch (e) {
            toast.error("Failed to load Admin Stats");
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

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Alpha Protocol...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Access Denied</div>;

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-red-600" />
                Admin Command Center
            </h1>

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

            {/* USER TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-semibold text-lg">User Database</h2>
                </div>
                <div className="overflow-x-auto">
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
                        <tbody className="divide-y divide-slate-50">
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
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                            {user.user_id?.substring(0, 12)}...
                                            <button
                                                onClick={() => navigator.clipboard.writeText(user.user_id)}
                                                className="hover:text-slate-600"
                                                title="Copy ID"
                                            >
                                                <small>📋</small>
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
                                            {/* STATUS BADGE */}
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

                                            {/* SEPARATOR */}
                                            <div className="h-4 w-px bg-slate-200 mx-1"></div>

                                            {/* BAN ACTION */}
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
            </div>
        </div>
    );
}
