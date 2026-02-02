import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Instagram, Linkedin, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/app-info";

export function AboutDeveloper() {
    return (
        <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-indigo-500 fill-indigo-500" />
                    About the Developer
                </CardTitle>
                <CardDescription>
                    Information about the creator of Blog OS.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                    Blog OS is designed and built by <strong>Luke Duff</strong>, a passionate Web Designer & Developer focused on creating intuitive tools for content creators.
                </p>
                <p className="text-sm text-slate-600">
                    This platform aims to bridge the gap between AI automation and human creativity, ensuring every piece of content feels personal and strategic.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="https://lukeduff.co.uk" target="_blank">
                            <Globe className="mr-2 h-4 w-4 text-slate-500" />
                            lukeduff.co.uk
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="https://www.instagram.com/luke_dufff/" target="_blank">
                            <Instagram className="mr-2 h-4 w-4 text-pink-500" />
                            @luke_dufff
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="https://www.linkedin.com/in/luke-duff/" target="_blank">
                            <Linkedin className="mr-2 h-4 w-4 text-blue-600" />
                            Luke Duff
                        </Link>
                    </Button>
                </div>

                <div className="text-xs text-slate-400 pt-4 border-t border-indigo-100">
                    Version {APP_VERSION} • Built with Next.js 15 & Tailwind CSS
                </div>
            </CardContent>
        </Card>
    );
}
