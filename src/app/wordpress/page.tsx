import { checkAccessStatus } from '@/actions/access';
import { redirect } from 'next/navigation';
import { WordPressClient } from '@/components/wordpress/wordpress-client';

export default async function WordPressPage() {
    // ✅ SECURITY: Server-side admin enforcement
    const status = await checkAccessStatus();

    if (status.role !== 'admin') {
        redirect('/');
    }

    return <WordPressClient />;
}
