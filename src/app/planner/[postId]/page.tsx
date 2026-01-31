import { getPostById } from '@/actions/planner';
import { PostViewer } from '@/components/planner/post-viewer';
import { notFound } from 'next/navigation';

// Next.js 15+ allows params to be async. We await it here.
export default async function ViewPostPage({ params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params;

    const post = await getPostById(postId);

    if (!post) {
        notFound();
    }

    return <PostViewer post={post} />;
}
