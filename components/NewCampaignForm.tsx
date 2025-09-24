import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import Button from './Button';
import { Loader } from 'lucide-react';
import type { Campaign } from '../types';
import { CampaignStatus } from '../types';

interface NewCampaignFormProps {
    onSuccess: (newCampaign: Campaign) => void;
}

const NewCampaignForm: React.FC<NewCampaignFormProps> = ({ onSuccess }) => {
    const { user } = useUser();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) {
            setError("Campaign name is required.");
            return;
        }

        setLoading(true);
        setError(null);

        const { data, error: insertError } = await supabase
            .from('campaigns')
            .insert({
                name,
                description,
                start_date: startDate || null,
                end_date: endDate || null,
                owner_id: user.id,
                team_id: user.team_id,
                status: CampaignStatus.PLANNED,
            })
            .select('*, profiles!owner_id(full_name)')
            .single();

        setLoading(false);

        if (insertError) {
            setError(insertError.message);
            console.error("Error creating campaign:", insertError);
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
                        className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                    />
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <input
                        type="date"
                        id="end_date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Campaign'}
                </Button>
            </div>
        </form>
    );
};

export default NewCampaignForm;
