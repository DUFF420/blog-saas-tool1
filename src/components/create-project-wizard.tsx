'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, ArrowLeft, Loader2, Wand2 } from 'lucide-react';
import { useProject } from '@/context/project-context';
import { createProject } from '@/actions/project';
import { toast } from 'sonner';

type WizardStep = 'basics' | 'services' | 'audience' | 'voice' | 'operational';

export function CreateProjectWizard({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<WizardStep>('basics');
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [services, setServices] = useState<string[]>([]);
    const [serviceInput, setServiceInput] = useState('');
    const [audience, setAudience] = useState('');
    const [painPoints, setPainPoints] = useState<string[]>([]);
    const [painPointInput, setPainPointInput] = useState('');
    const [tone, setTone] = useState('');
    const [locations, setLocations] = useState<string[]>([]);
    const [locationInput, setLocationInput] = useState('');

    const { reloadContext, selectProject } = useProject();

    const handleCreate = async () => {
        if (!name || !domain) {
            toast.error("Name and Domain are required");
            return;
        }

        setIsLoading(true);
        try {
            const newProject = await createProject({
                name,
                domain,
                business: {
                    services,
                    targetAudience: audience,
                    painPoints,
                    desiredActions: ['Call for Quote', 'Book Online'], // Default
                    locations: locations.length > 0 ? locations : undefined
                },
                brand: {
                    tone: tone || 'Professional and Trustworthy',
                    writingStyle: 'Clear, concise, and persuasive',
                    readingLevel: 'Grade 8',
                    doNots: []
                },
                keywords: { target: [], negative: [] }, // Can fill later
                seoRules: { internalLinkDensity: 'medium' },
                styling: { referenceHtml: '' },
                globalContext: '',
                domainInfo: { titles: [name], urls: [] },
                notes: ''
            });

            await reloadContext();

            // Auto-switch to new project
            if (newProject && newProject.id) {
                selectProject(newProject.id);
                toast.success(`Project "${newProject.name}" created and selected!`);
            } else {
                toast.success("Project created successfully!");
            }

            setOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create project");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setStep('basics');
        setName('');
        setDomain('');
        setServices([]);
        setAudience('');
        setPainPoints([]);
        setTone('');
        setLocations([]);
    };

    const nextStep = () => {
        if (step === 'basics') setStep('services');
        else if (step === 'services') setStep('audience');
        else if (step === 'audience') setStep('voice');
        else if (step === 'voice') setStep('operational'); // Or finish
    };

    const prevStep = () => {
        if (step === 'services') setStep('basics');
        else if (step === 'audience') setStep('services');
        else if (step === 'voice') setStep('audience');
        else if (step === 'operational') setStep('voice');
    };

    const addList = (input: string, setInput: (v: string) => void, list: string[], setList: (v: string[]) => void) => {
        if (input.trim()) {
            setList([...list, input.trim()]);
            setInput('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <div className="flex items-center gap-3 p-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md cursor-pointer transition-colors border border-dashed border-slate-700 hover:border-slate-500">
                        <div className="bg-indigo-600/20 p-2 rounded-md">
                            <Plus className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div>
                            <span className="font-medium block text-slate-200">New Project</span>
                            <span className="text-xs text-slate-500">Launch Wizard</span>
                        </div>
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Follow the wizard to set up your AI's context.
                    </DialogDescription>
                    <div className="flex gap-1 mt-2 mb-2">
                        {/* Stepper Dots */}
                        {['basics', 'services', 'audience', 'voice'].map((s, i) => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full ${['basics', 'services', 'audience', 'voice'].indexOf(step) >= i ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
                    {/* STEP 1: BASICS */}
                    {step === 'basics' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="bg-indigo-50 p-4 rounded-lg flex gap-3 text-indigo-900 mb-4">
                                <Wand2 className="h-5 w-5 shrink-0" />
                                <p className="text-sm">Let's start with the unique identity of this website.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label>Project Name</Label>
                                <Input placeholder="e.g. Acme Plumbing Co." value={name} onChange={e => setName(e.target.value)} autoFocus />
                            </div>
                            <div className="grid gap-2">
                                <Label>Primary Domain</Label>
                                <Input placeholder="https://acmeplumbing.com" value={domain} onChange={e => setDomain(e.target.value)} />
                                <p className="text-xs text-slate-500">We'll use this to structure internal links.</p>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SERVICES & LOCATIONS */}
                    {step === 'services' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="grid gap-2">
                                <Label>What services does this business offer?</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Emergency Repairs"
                                        value={serviceInput}
                                        onChange={e => setServiceInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addList(serviceInput, setServiceInput, services, setServices)}
                                    />
                                    <Button onClick={() => addList(serviceInput, setServiceInput, services, setServices)} variant="secondary">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {services.map((s, i) => (
                                        <Badge key={i} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                            {s} <button onClick={() => setServices(services.filter((_, idx) => idx !== i))} className="hover:text-red-500 rounded-full p-0.5"><Plus className="h-3 w-3 rotate-45" /></button>
                                        </Badge>
                                    ))}
                                    {services.length === 0 && <span className="text-sm text-slate-400 italic">No services added yet.</span>}
                                </div>
                            </div>

                            <div className="grid gap-2 pt-4">
                                <Label>Target Locations (Service Areas)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Manchester, UK"
                                        value={locationInput}
                                        onChange={e => setLocationInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addList(locationInput, setLocationInput, locations, setLocations)}
                                    />
                                    <Button onClick={() => addList(locationInput, setLocationInput, locations, setLocations)} variant="secondary">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {locations.map((l, i) => (
                                        <Badge key={i} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                            {l} <button onClick={() => setLocations(locations.filter((_, idx) => idx !== i))} className="hover:text-red-500 rounded-full p-0.5"><Plus className="h-3 w-3 rotate-45" /></button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: AUDIENCE & PAIN POINTS */}
                    {step === 'audience' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="grid gap-2">
                                <Label>Who is the target audience?</Label>
                                <Textarea
                                    placeholder="e.g. Homeowners in older properties who are worried about winter pipe bursts."
                                    value={audience}
                                    onChange={e => setAudience(e.target.value)}
                                    className="h-20"
                                />
                            </div>
                            <div className="grid gap-2 pt-2">
                                <Label>What are their biggest pain points?</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Expanding water damage costs"
                                        value={painPointInput}
                                        onChange={e => setPainPointInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addList(painPointInput, setPainPointInput, painPoints, setPainPoints)}
                                    />
                                    <Button onClick={() => addList(painPointInput, setPainPointInput, painPoints, setPainPoints)} variant="secondary">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {painPoints.map((p, i) => (
                                        <Badge key={i} className="pl-2 pr-1 py-1 flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                                            {p} <button onClick={() => setPainPoints(painPoints.filter((_, idx) => idx !== i))} className="hover:text-red-900 rounded-full p-0.5"><Plus className="h-3 w-3 rotate-45" /></button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: VOICE */}
                    {step === 'voice' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="grid gap-2">
                                <Label>What is the brand tone?</Label>
                                <Input
                                    placeholder="e.g. Friendly, Reassuring, Expert"
                                    value={tone}
                                    onChange={e => setTone(e.target.value)}
                                />
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg mt-4">
                                <h4 className="font-semibold text-indigo-900 mb-2">Summary</h4>
                                <ul className="text-sm text-indigo-800 space-y-1 list-disc pl-4">
                                    <li><strong>Project:</strong> {name} ({domain})</li>
                                    <li><strong>Services:</strong> {services.length} added</li>
                                    <li><strong>Audience:</strong> {audience.slice(0, 30)}...</li>
                                    <li><strong>Tone:</strong> {tone}</li>
                                </ul>
                            </div>
                        </div>
                    )}

                </div>

                <div className="flex justify-between border-t pt-4 mt-auto">
                    {step !== 'basics' ? (
                        <Button variant="ghost" onClick={prevStep} disabled={isLoading}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step === 'voice' ? (
                        <Button onClick={handleCreate} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Launch Project'}
                        </Button>
                    ) : (
                        <Button onClick={nextStep} disabled={!name && step === 'basics'}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
