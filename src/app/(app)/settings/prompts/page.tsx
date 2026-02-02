import { checkAccessStatus } from '@/actions/access';
import { redirect } from 'next/navigation';
import { SystemPromptsClient } from '@/components/settings/system-prompts-client';

export default async function PromptSettingsPage() {
    // ✅ SECURITY: Server-side admin enforcement
    const status = await checkAccessStatus();

    if (status.role !== 'admin') {
        redirect('/dashboard');
    }

    return <SystemPromptsClient />;
}
