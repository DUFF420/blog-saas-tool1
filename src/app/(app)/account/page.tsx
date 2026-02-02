'use client';

import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Shield, User } from "lucide-react";
import { logoutAccessSession } from "@/actions/access";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AccountPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const handleLogout = async () => {
        // 1. Clear Site Access Cookie
        await logoutAccessSession();

        // 2. Sign out of Clerk
        await signOut(() => router.push('/sign-in'));

        toast.success("Logged out successfully");
    };

    if (!isLoaded) return <div className="p-8">Loading Profile...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Account</h1>
                <p className="text-slate-500">Manage your profile and session.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>Details from your authenticated session.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                            <p className="font-medium text-slate-900 mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Plan</label>
                            <p className="font-medium text-indigo-600 mt-1">Free Beta</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border md:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</label>
                            <p className="font-mono text-xs text-slate-600 mt-2 break-all">{user?.id}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-100">
                <CardHeader>
                    <CardTitle className="text-red-900 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Session Management
                    </CardTitle>
                    <CardDescription className="text-red-700">End your current session securely.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div>
                            <h4 className="font-medium text-red-900">Sign Out</h4>
                            <p className="text-sm text-red-700">This will remove your access cookie and log you out.</p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                toast.loading("Logging out...");
                                await logoutAccessSession();
                                await signOut(() => {
                                    window.location.href = "/sign-in";
                                });
                            }}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
