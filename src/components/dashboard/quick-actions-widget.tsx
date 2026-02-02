'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, RefreshCw, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function QuickActionsWidget() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href="/planner?action=new" className="block">
                    <Button className="w-full justify-start gap-2" variant="default">
                        <Plus className="h-4 w-4" />
                        New Blog Post
                    </Button>
                </Link>

                <Link href="/planner?view=ideas" className="block">
                    <Button className="w-full justify-start gap-2" variant="outline">
                        <Sparkles className="h-4 w-4" />
                        Browse Idea Bank
                    </Button>
                </Link>

                <Link href="/context?tab=domain" className="block">
                    <Button className="w-full justify-start gap-2" variant="outline">
                        <RefreshCw className="h-4 w-4" />
                        Fetch Latest Sitemap
                    </Button>
                </Link>

                <Link href="/tools" className="block">
                    <Button className="w-full justify-start gap-2" variant="outline">
                        <FileText className="h-4 w-4" />
                        SEO Tools & Resources
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
