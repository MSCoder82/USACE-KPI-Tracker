import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import Button from './Button';
import { Loader } from 'lucide-react';
import type { MediaLog, Campaign } from '../types';
import { Sentiment } from '../types';

interface NewMediaLogFormProps {
    onSuccess: (log: MediaLog) => void;
    logToEdit?: MediaLog | null;
}

const NewMediaLogForm: React.FC<NewMediaLogFormProps> = ({ onSuccess, logToEdit }) => {
    const { user } = useUser();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [outlet, setOutlet] = useState('');
    const [headline, setHeadline] = useState('');
    const [sentiment, setSentiment] = useState<Sentiment>(Sentiment.NEUTRAL);
    const [reach, setReach] = useState<number | ''>('');
    const [campaignId, setCampaignId] = useState('');
    
    const [campaigns, setCampaigns] = useState<Pick<Campaign, 'id' | 'name'>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!logToEdit;

    useEffect(() => {
        if (isEditMode) {
            setDate(logToEdit.date);
            setOutlet(logToEdit.outlet);
            setHeadline(logToEdit.headline || '');
            setSentiment(logToEdit.sentiment || Sentiment.NEUTRAL);
            setReach(logToEdit.reach ?? '');
            setCampaignId(logToEdit.campaign_id || '');
        }
    }, [logToEdit, isEditMode]);

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
        if (!user || !date || !outlet) {
            setError("Date and Outlet are required.");
            return;
        }

        setLoading(true);
        setError(null);

        const logData = {
            date,
            outlet,
            headline,
            sentiment,
            reach: reach || null,
            campaign_id: campaignId || null,
            team_id: user.team_id,
        };

        let data: MediaLog | null = null;
        let submissionError: any = null;

        if (isEditMode) {
            const { data: updateData, error: updateError } = await supabase
                .from('media_logs')
                .update(logData)
                .eq('id', logToEdit.id)
                .select('*, campaigns(name)')
                .single();
            data = updateData;
            submissionError = updateError;
        } else {
            const { data: insertData, error: insertError } = await supabase
                .from('media_logs')
                .insert(logData)
                .select('*, campaigns(name)')
                .single();
            data = insertData;
            submissionError = insertError;
        }

        setLoading(false);

        if (submissionError) {
            setError(submissionError.message);
        } else if (data) {
            onSuccess(data as MediaLog);
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
                    <label htmlFor="outlet" className="block text-sm font-medium text-gray-300 mb-1">Outlet *</label>
                    <input type="text" id="outlet" value={outlet} onChange={(e) => setOutlet(e.target.value)} required className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
                </div>
            </div>

            <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-300 mb-1">Headline</label>
                <input type="text" id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="sentiment" className="block text-sm font-medium text-gray-300 mb-1">Sentiment</label>
                    <select id="sentiment" value={sentiment} onChange={(e) => setSentiment(e.target.value as Sentiment)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                        {Object.values(Sentiment).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="reach" className="block text-sm font-medium text-gray-300 mb-1">Reach</label>
                    <input type="number" id="reach" value={reach} onChange={(e) => setReach(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
                </div>
            </div>
            
            <div>
                <label htmlFor="campaignId" className="block text-sm font-medium text-gray-300 mb-1">Associate with Campaign</label>
                <select id="campaignId" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                    <option value="">None</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            
            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading}>
                    {loading ? (isEditMode ? 'Saving...' : 'Logging...') : (isEditMode ? 'Save Changes' : 'Add Media Log')}
                </Button>
            </div>
        </form>
    );
};

export default NewMediaLogForm;