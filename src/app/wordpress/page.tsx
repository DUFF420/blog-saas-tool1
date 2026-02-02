import { checkAccessStatus } from '@/actions/access';
import { redirect } from 'next/navigation';
import { WordPressClient } from '@/components/wordpress/wordpress-client';

export default async function WordPressPage() {
    return <WordPressClient />;
}
