import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "The Blog OS | Scale your company blog at the speed of AI",
    description: "The complete content operating system for SaaS founders. Plan, write, and publish SEO-optimized articles that match your brand voice.",
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {children}
        </div>
    );
}
