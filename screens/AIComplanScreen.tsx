import React, { useState, useCallback, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { generateComplan } from '../services/geminiService';
import type { ComplanSection, Campaign } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import { Bot, Loader, Upload } from 'lucide-react';

type ComplanInputs = {
    campaignId: string;
    objectives: string;
    audiences: string;
    key_messages: string;
    channels: string;
    timeline: string;
    constraints: string;
    kpi_targets: string;
};

const TextareaField: React.FC<{
    name: keyof ComplanInputs;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ name, label, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            rows={2}
            value={value}
            onChange={onChange}
            className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
        />
    </div>
);


const AIComplanScreen: React.FC = () => {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<ComplanSection[] | null>(null);
    const [campaigns, setCampaigns] = useState<Pick<Campaign, 'id' | 'name'>[]>([]);
    const [inputs, setInputs] = useState<ComplanInputs>({
        campaignId: '',
        objectives: '',
        audiences: '',
        key_messages: '',
        channels: '',
        timeline: '',
        constraints: '',
        kpi_targets: '',
    });

    useEffect(() => {
        if (!user?.team_id) return;
        const fetchCampaigns = async () => {
            const { data, error } = await supabase
                .from('campaigns')
                .select('id, name')
                .eq('team_id', user.team_id)
                .order('name', { ascending: true });
            
            if (data) {
                setCampaigns(data);
            }
        };
        fetchCampaigns();
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPlan(null);

        const formattedInputs = {
            campaignName: campaigns.find(c => c.id === inputs.campaignId)?.name || 'N/A',
            objectives: inputs.objectives.split('\n').filter(Boolean),
            audiences: inputs.audiences.split('\n').filter(Boolean),
            key_messages: inputs.key_messages.split('\n').filter(Boolean),
            channels: inputs.channels.split('\n').filter(Boolean),
            timeline: inputs.timeline,
            constraints: inputs.constraints,
            kpi_targets: inputs.kpi_targets.split('\n').filter(Boolean),
        };

        try {
            const result = await generateComplan(formattedInputs);
            const sections: ComplanSection[] = [
                { title: 'Situation', content: result.situation },
                { title: 'Objectives', content: result.objectives },
                { title: 'Audiences', content: result.audiences },
                { title: 'Key Messages', content: result.key_messages },
                { title: 'Tactics & Channels', content: result.tactics_channels },
                { title: 'Timeline', content: result.timeline },
                { title: 'Resources', content: result.resources },
                { title: 'Coordination', content: result.coordination },
                { title: 'Risks & Mitigation', content: result.risks_mitigation },
                { title: 'Metrics & Evaluation', content: result.metrics_evaluation },
            ];
            setPlan(sections);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputs, campaigns]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">AI COMPLAN Generator</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Plan Inputs">
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="campaignId" className="block text-sm font-medium text-gray-300 mb-1">Campaign</label>
                            <select id="campaignId" name="campaignId" value={inputs.campaignId} onChange={handleInputChange} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                                <option value="">Select a campaign</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <TextareaField name="objectives" label="Objectives (one per line)" value={inputs.objectives} onChange={handleInputChange} />
                        <TextareaField name="audiences" label="Audiences (one per line)" value={inputs.audiences} onChange={handleInputChange} />
                        <TextareaField name="key_messages" label="Key Messages (one per line)" value={inputs.key_messages} onChange={handleInputChange} />
                        <TextareaField name="channels" label="Channels (one per line)" value={inputs.channels} onChange={handleInputChange} />
                         <div>
                            <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-1">Timeline</label>
                            <input type="text" id="timeline" name="timeline" value={inputs.timeline} onChange={handleInputChange} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
                        </div>
                        <TextareaField name="constraints" label="Constraints" value={inputs.constraints} onChange={handleInputChange} />
                        <TextareaField name="kpi_targets" label="KPI Targets (one per line)" value={inputs.kpi_targets} onChange={handleInputChange} />
                         <div>
                            <label htmlFor="references" className="block text-sm font-medium text-gray-300 mb-1">References</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-usace-border border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-usace-card rounded-md font-medium text-usace-red hover:text-red-400 focus-within:outline-none">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                </div>
                            </div>
                        </div>
                        <Button onClick={handleGenerate} disabled={isLoading} Icon={isLoading ? Loader : Bot} className="w-full" type="button">
                            {isLoading ? 'Generating...' : 'Generate Draft'}
                        </Button>
                    </form>
                </Card>

                <Card title="Generated Plan Sections">
                    {isLoading && <div className="flex justify-center items-center h-full"><Loader className="animate-spin h-8 w-8 text-usace-red" /></div>}
                    {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
                    {plan && (
                         <div className="space-y-4">
                            {plan.map(section => (
                                <div key={section.title}>
                                    <h4 className="font-semibold text-usace-red text-md">{section.title}</h4>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{section.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {!isLoading && !error && !plan && <div className="text-center text-gray-400">Your generated plan will appear here.</div>}
                </Card>
            </div>
        </div>
    );
};

export default AIComplanScreen;