import { checkAccessStatus } from '@/actions/access';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { role } = await checkAccessStatus();

    if (role !== 'admin') {
        redirect('/admin/forbidden'); // Strict Access Denied Page
    }

    return <>{children}</>;
}
