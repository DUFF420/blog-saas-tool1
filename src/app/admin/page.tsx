import { checkAccessStatus } from '@/actions/access';
import { getAdminStats } from '@/actions/admin';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client';

export default async function AdminPage() {
    // ✅ SECURITY: Server-side role enforcement
    const status = await checkAccessStatus();

    // Block non-admins BEFORE any rendering
    if (status.role !== 'admin') {
        redirect('/admin/forbidden');
    }

    // Fetch initial data server-side
    let initialData;
    try {
        initialData = await getAdminStats();
    } catch (error) {
        // If admin check passes but stats fail, something's wrong
        redirect('/admin/forbidden');
    }

    // Pass data to client component
    return <AdminDashboardClient initialData={initialData} />;
}
