import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Search, Key, Globe } from "lucide-react";
import Link from "next/link";

export default function ToolsPage() {
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
        </div>
    );
}
