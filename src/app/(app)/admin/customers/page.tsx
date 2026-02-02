import { checkAccessStatus } from '@/actions/access';
import { redirect } from 'next/navigation';
import { CustomersClient } from '@/components/admin/customers-client';

export default async function CustomersPage() {
    // ✅ SECURITY: Server-side admin enforcement
    const status = await checkAccessStatus();

    if (status.role !== 'admin') {
        redirect('/admin/forbidden');
    }

    return <CustomersClient />;
}
