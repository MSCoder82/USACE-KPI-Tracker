import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import Button from './Button';
import { Loader } from 'lucide-react';
import type { Input, Campaign } from '../types';
import { InputCategory } from '../types';
import { OUTPUTS, OUTTAKES, OUTCOMES } from '../data/inputOptions';

interface LogInputFormProps {
    onSuccess: (input: Input) => void;
    inputToEdit?: Input | null;
}

const LogInputForm: React.FC<LogInputFormProps> = ({ onSuccess, inputToEdit }) => {
    const { user } = useUser();
    const [category, setCategory] = useState<InputCategory | ''>('');
    const [name, setName] = useState('');
    const [customName, setCustomName] = useState('');
    const [quantity, setQuantity] = useState<number | ''>(1);
    const [notes, setNotes] = useState('');
    const [campaignId, setCampaignId] = useState('');
    
    const [campaigns, setCampaigns] = useState<Pick<Campaign, 'id' | 'name'>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!inputToEdit;

    useEffect(() => {
        if (isEditMode) {
            setCategory(inputToEdit.category);
            setName(inputToEdit.name);
            setCustomName(inputToEdit.custom_name || '');
            setQuantity(inputToEdit.quantity ?? '');
            setNotes(inputToEdit.notes || '');
            setCampaignId(inputToEdit.campaign_id || '');
        }
    }, [inputToEdit, isEditMode]);

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
        if (!user || !category || !name) {
            setError("Category and Name are required.");
            return;
        }
        if (name === 'Other' && !customName.trim()) {
            setError("Please specify the custom name.");
            return;
        }

        setLoading(true);
        setError(null);

        const inputData = {
            category,
            name,
            custom_name: name === 'Other' ? customName : null,
            quantity: quantity || null,
            notes: notes || null,
            campaign_id: campaignId || null,
            created_by: user.id,
            team_id: user.team_id,
        };
        
        let data: Input | null = null;
        let submissionError: any = null;

        if (isEditMode) {
            const { data: updateData, error: updateError } = await supabase
                .from('inputs')
                .update(inputData)
                .eq('id', inputToEdit.id)
                .select('*, campaigns(name), profiles!created_by(full_name)')
                .single();
            data = updateData;
            submissionError = updateError;
        } else {
            const { data: insertData, error: insertError } = await supabase
                .from('inputs')
                .insert(inputData)
                .select('*, campaigns(name), profiles!created_by(full_name)')
                .single();
            data = insertData;
            submissionError = insertError;
        }

        setLoading(false);

        if (submissionError) {
            setError(submissionError.message);
        } else if (data) {
            onSuccess(data as Input);
        }
    };

    const getDropdownOptions = () => {
        switch (category) {
            case InputCategory.OUTPUT: return OUTPUTS;
            case InputCategory.OUTTAKE: return OUTTAKES;
            case InputCategory.OUTCOME: return OUTCOMES;
            default: return [];
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
            
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value as InputCategory)} required className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                    <option value="" disabled>Select a category</option>
                    {Object.values(InputCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {category && (
                <>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                        <select id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                            <option value="" disabled>Select an item</option>
                            {getDropdownOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            <option value="Other">Other...</option>
                        </select>
                    </div>

                    {name === 'Other' && (
                        <div>
                            <label htmlFor="customName" className="block text-sm font-medium text-gray-300 mb-1">Custom Name *</label>
                            <input type="text" id="customName" value={customName} onChange={(e) => setCustomName(e.target.value)} required className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
                        </div>
                    )}

                    {(category === InputCategory.OUTPUT || category === InputCategory.OUTTAKE) && (
                         <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
                        </div>
                    )}
                     
                    {category === InputCategory.OUTCOME && (
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
                        </div>
                    )}

                    <div>
                        <label htmlFor="campaignId" className="block text-sm font-medium text-gray-300 mb-1">Associate with Campaign</label>
                        <select id="campaignId" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                            <option value="">None</option>
                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </>
            )}

            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading || !category}>
                    {loading ? (isEditMode ? 'Saving...' : 'Logging...') : (isEditMode ? 'Save Changes' : 'Log Input')}
                </Button>
            </div>
        </form>
    );
};

export default LogInputForm;