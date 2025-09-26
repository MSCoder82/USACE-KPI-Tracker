import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import Button from './Button';
import { Loader } from 'lucide-react';
import type { Campaign } from '../types';
import { CampaignStatus } from '../types';

interface NewCampaignFormProps {
    onSuccess: (campaign: Campaign) => void;
    campaignToEdit?: Campaign | null;
}

const NewCampaignForm: React.FC<NewCampaignFormProps> = ({ onSuccess, campaignToEdit }) => {
    const { user } = useUser();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState<CampaignStatus>(CampaignStatus.PLANNED);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!campaignToEdit;

    useEffect(() => {
        if (isEditMode) {
            setName(campaignToEdit.name);
            setDescription(campaignToEdit.description || '');
            setStartDate(campaignToEdit.start_date || '');
            setEndDate(campaignToEdit.end_date || '');
            setStatus(campaignToEdit.status);
        }
    }, [campaignToEdit, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) {
            setError("Campaign name is required.");
            return;
        }

        setLoading(true);
        setError(null);

        const campaignData = {
            name,
            description,
            start_date: startDate || null,
            end_date: endDate || null,
            owner_id: user.id,
            team_id: user.team_id,
            status,
        };

        let data: Campaign | null = null;
        let submissionError: any = null;

        if (isEditMode) {
            const { data: updateData, error: updateError } = await supabase
                .from('campaigns')
                .update(campaignData)
                .eq('id', campaignToEdit.id)
                .select('*, profiles!owner_id(full_name)')
                .single();
            data = updateData;
            submissionError = updateError;
        } else {
            const { data: insertData, error: insertError } = await supabase
                .from('campaigns')
                .insert(campaignData)
                .select('*, profiles!owner_id(full_name)')
                .single();
            data = insertData;
            submissionError = insertError;
        }

        setLoading(false);

        if (submissionError) {
            setError(submissionError.message);
            console.error("Error submitting campaign:", submissionError);
        } else if (data) {
            onSuccess(data as Campaign);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
            
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Campaign Name *</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <input
                        type="date"
                        id="start_date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200"
                    />
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <input
                        type="date"
                        id="end_date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200"
                    />
                </div>
            </div>

            {isEditMode && (
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                        className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                    >
                        {Object.values(CampaignStatus).map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading}>
                    {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Campaign')}
                </Button>
            </div>
        </form>
    );
};

export default NewCampaignForm;