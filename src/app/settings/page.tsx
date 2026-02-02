'use client';

import { useProject } from '@/context/project-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Save, Trash2, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { AboutDeveloper } from '@/components/settings/about-developer';
import { ExportDialog } from '@/components/settings/export-dialog';
import { DeleteProjectDialog } from '@/components/settings/delete-project-dialog';
import Image from 'next/image';

export default function SettingsPage() {
    const { activeProject, reloadContext } = useProject();
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeProject) {
            setName(activeProject.name);
            setDomain(activeProject.domain);
        }
    }, [activeProject]);

    if (!activeProject) {
        return <div className="text-center p-8 text-slate-500">Select a project to view settings.</div>;
    }

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { updateProject } = await import('@/actions/project');
            await updateProject(activeProject.id, { name, domain });
            await reloadContext();
            toast.success("Settings saved successfully");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-8 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white p-2">
                    <Image src="/logo.png" alt="Project Logo" fill className="object-contain" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
                    <p className="text-slate-500">Manage configuration for {activeProject.name}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Basic details about your project.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="domain">Primary Domain</Label>
                        <Input
                            id="domain"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                        />
                    </div>
                    <div className="pt-2">
                        <Button onClick={handleSave} disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Export your data for backup purposes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                            <Save className="h-5 w-5 text-slate-600" />
                            <div>
                                <h4 className="font-medium text-slate-900">Export Full Backup</h4>
                                <p className="text-sm text-slate-500">Download a JSON file containing all projects and settings.</p>
                            </div>
                        </div>
                        <ExportDialog />
                    </div>
                </CardContent>
            </Card>



            <Card className="border-red-100">
                <CardHeader>
                    <CardTitle className="text-red-900">Danger Zone</CardTitle>
                    <CardDescription className="text-red-700">Irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <div>
                                <h4 className="font-medium text-red-900">Delete Project</h4>
                                <p className="text-sm text-red-700">Permanently remove this project and all its data.</p>
                            </div>
                        </div>
                        <DeleteProjectDialog projectId={activeProject.id} projectName={activeProject.name} />
                    </div>
                </CardContent>
            </Card>
            {/* About Developer Section */}
            <AboutDeveloper />
        </div >
    );
}
