'use client';

import { useEffect, useState } from 'react';
import { getCustomers, toggleUserBan } from '@/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export function CustomersClient() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getCustomers();
            setUsers(data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load customers.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBan = async (userId: string, currentStatus: boolean) => {
        try {
            const result = await toggleUserBan(userId, currentStatus);
            if (result.success) {
                toast.success(`User ${!currentStatus ? 'Banned' : 'Unbanned'}`);
                loadUsers(); // Refresh
            } else {
                toast.error(result.error);
            }
        } catch (e) {
            toast.error("Action failed");
        }
    };

    if (loading) return <div className="p-8">Loading Customers...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h1>
                    <p className="text-slate-500">Manage registered users.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Directory</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Blogs Planned</TableHead>
                                <TableHead className="text-center">Blogs Generated</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div>{user.email || 'No Email'}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{user.user_id}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_banned ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.is_banned ? 'Banned' : 'Active'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {user.stats?.totalPlanned || 0}
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-green-600">
                                        {user.stats?.totalGenerated || 0}
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={!user.is_banned}
                                                onCheckedChange={() => handleToggleBan(user.user_id, user.is_banned)}
                                            />
                                            <span className="text-xs text-slate-500">
                                                {user.is_banned ? 'Unblock' : 'Block'}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
