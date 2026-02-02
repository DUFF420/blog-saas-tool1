'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Search, Key, Globe, Sparkles, Bell, Briefcase } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { registerLaunchInterest } from '@/actions/launch';

export default function ToolsPage() {
    const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUser();

    async function handleNotifyMe() {
        const emailToUse = email || user?.primaryEmailAddress?.emailAddress || '';

        if (!emailToUse) {
            toast.error('Please provide an email address');
            return;
        }

        setIsSubmitting(true);
        const result = await registerLaunchInterest('FreelancePro Command Center', emailToUse);

        if (result.success) {
            toast.success("You'll be notified when FreelancePro launches!");
            setNotifyDialogOpen(false);
            setEmail('');
        } else {
            toast.error('Failed to register interest. Please try again.');
        }
        setIsSubmitting(false);
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Tools & Resources</h1>
                <p className="text-slate-500">External tools to help you master your SEO strategy.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Answer The Public */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <Search className="h-6 w-6" />
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-400" />
                        </div>
                        <CardTitle className="mt-4">Answer The Public</CardTitle>
                        <CardDescription>Visualizing search questions & suggested autocomplete.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-4 h-12">
                            Great for finding "How-to" questions and understanding exact user intent.
                        </p>
                        <Link
                            href="https://answerthepublic.com/"
                            target="_blank"
                            className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center"
                        >
                            Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    </CardContent>
                </Card>

                {/* Google Keyword Planner */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                <Globe className="h-6 w-6" />
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-400" />
                        </div>
                        <CardTitle className="mt-4">Google Keyword Planner</CardTitle>
                        <CardDescription>The direct source from Google Ads.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-4 h-12">
                            Best for search volume data and cost-per-click estimates. Requires a Google Ads account.
                        </p>
                        <Link
                            href="https://ads.google.com/home/tools/keyword-planner/"
                            target="_blank"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                        >
                            Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    </CardContent>
                </Card>

                {/* KeySearch */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Key className="h-6 w-6" />
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-400" />
                        </div>
                        <CardTitle className="mt-4">KeySearch</CardTitle>
                        <CardDescription>Affordable and powerful keyword research.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-4 h-12">
                            Excellent for competitor analysis and finding low-competition keywords.
                        </p>
                        <Link
                            href="https://www.keysearch.co/"
                            target="_blank"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
                        >
                            Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Coming Soon: FreelancePro Command Center */}
            <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 p-8 mt-8">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-purple-300/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-40 w-40 rounded-full bg-indigo-300/20 blur-3xl" />

                <div className="relative">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Briefcase className="h-8 w-8 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white mb-3 shadow-md">
                                Coming Soon
                            </Badge>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                FreelancePro Command Center
                            </h3>
                            <p className="text-slate-600 mb-4 max-w-2xl">
                                The ultimate dashboard for freelance web designers and developers. Manage clients,
                                track projects, send invoices, and run your entire freelance business from one
                                powerful platform. Built by freelancers, for freelancers.
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium">Expected Launch: Q2 2026</span>
                                </div>

                                {/* Notify Me Dialog */}
                                <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <Bell className="h-4 w-4" />
                                            Notify Me at Launch
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Get Notified at Launch 🚀</DialogTitle>
                                            <DialogDescription>
                                                We'll send you an email when FreelancePro Command Center launches in Q2 2026
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={user?.primaryEmailAddress?.emailAddress || "your@email.com"}
                                                className="w-full"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setNotifyDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleNotifyMe} disabled={isSubmitting}>
                                                {isSubmitting ? 'Submitting...' : 'Register Interest'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
