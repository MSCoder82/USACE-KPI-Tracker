import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import Button from './Button';
import { Loader } from 'lucide-react';
import type { Engagement, Campaign } from '../types';
import { EngagementType } from '../types';

interface NewEngagementFormProps {
    onSuccess: (engagement: Engagement) => void;
    engagementToEdit?: Engagement | null;
}

const NewEngagementForm: React.FC<NewEngagementFormProps> = ({ onSuccess, engagementToEdit }) => {
    const { user } = useUser();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<EngagementType>(EngagementType.BRIEFING);
    const [audience, setAudience] = useState('');
    const [location, setLocation] = useState('');
    const [outcomes, setOutcomes] = useState('');
    const [campaignId, setCampaignId] = useState('');
    
    const [campaigns, setCampaigns] = useState<Pick<Campaign, 'id' | 'name'>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!engagementToEdit;

    useEffect(() => {
        if (isEditMode) {
            setDate(engagementToEdit.date);
            setType(engagementToEdit.type);
            setAudience(engagementToEdit.audience || '');
            setLocation(engagementToEdit.location || '');
            setOutcomes(engagementToEdit.outcomes || '');
            setCampaignId(engagementToEdit.campaign_id || '');
        }
    }, [engagementToEdit, isEditMode]);

    useEffect(() => {
        if (!user?.team_id) return;
        const fetchCampaigns = async () => {
            const { data } = await supabase
                .from('campaigns')
                .select('id, name')
                .eq('team_id', user.team_id);
            if (data) setCampaigns(data);
        };
        fetchCampaigns();
    }, [user?.team_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !date || !type) {
            setError("Date and Type are required.");
            return;
        }

        setLoading(true);
        setError(null);

        const engagementData = {
            date,
            type,
            audience,
            location,
            outcomes,
            campaign_id: campaignId || null,
            team_id: user.team_id,
        };
        
        let data: Engagement | null = null;
        let submissionError: any = null;

        if (isEditMode) {
            const { data: updateData, error: updateError } = await supabase
                .from('engagements')
                .update(engagementData)
                .eq('id', engagementToEdit.id)
                .select('*, campaigns(name)')
                .single();
            data = updateData;
            submissionError = updateError;
        } else {
            const { data: insertData, error: insertError } = await supabase
                .from('engagements')
                .insert(engagementData)
                .select('*, campaigns(name)')
                .single();
            data = insertData;
            submissionError = insertError;
        }


        setLoading(false);

        if (submissionError) {
            setError(submissionError.message);
        } else if (data) {
            onSuccess(data as Engagement);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
                    <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
                </div>
                 <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
                    <select id="type" value={type} onChange={(e) => setType(e.target.value as EngagementType)} required className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                        {Object.values(EngagementType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-1">Audience</label>
                <input type="text" id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
            </div>

            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
            </div>
            
            <div>
                <label htmlFor="campaignId" className="block text-sm font-medium text-gray-300 mb-1">Associate with Campaign</label>
                <select id="campaignId" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                    <option value="">None</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="outcomes" className="block text-sm font-medium text-gray-300 mb-1">Outcomes / Notes</label>
                <textarea id="outcomes" value={outcomes} onChange={(e) => setOutcomes(e.target.value)} rows={3} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
            </div>
            
            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading}>
                    {loading ? (isEditMode ? 'Saving...' : 'Logging...') : (isEditMode ? 'Save Changes' : 'Log Engagement')}
                </Button>
            </div>
        </form>
    );
};

export default NewEngagementForm;