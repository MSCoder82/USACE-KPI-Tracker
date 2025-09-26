import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import Button from './Button';
import { Loader } from 'lucide-react';
import type { Goal, KpiType } from '../types';
import { KpiOptions } from '../types';

interface NewGoalFormProps {
    onSuccess: () => void;
    campaignId: string;
    goalToEdit?: Goal | null;
}

const NewGoalForm: React.FC<NewGoalFormProps> = ({ onSuccess, campaignId, goalToEdit }) => {
    const { user } = useUser();
    const [description, setDescription] = useState('');
    const [kpiType, setKpiType] = useState<KpiType>('total_media_reach');
    const [targetValue, setTargetValue] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!goalToEdit;

    useEffect(() => {
        if (isEditMode) {
            setDescription(goalToEdit.description);
            setKpiType(goalToEdit.kpi_type);
            setTargetValue(goalToEdit.target_value);
        }
    }, [goalToEdit, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !description.trim() || targetValue === '') {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        setError(null);

        const goalData = {
            description,
            kpi_type: kpiType,
            target_value: Number(targetValue),
            campaign_id: campaignId,
            team_id: user.team_id,
        };

        let submissionError: any = null;

        if (isEditMode) {
            const { error } = await supabase
                .from('goals')
                .update(goalData)
                .eq('id', goalToEdit.id);
            submissionError = error;
        } else {
            const { error } = await supabase
                .from('goals')
                .insert(goalData);
            submissionError = error;
        }

        setLoading(false);

        if (submissionError) {
            setError(submissionError.message);
            console.error("Error submitting goal:", submissionError);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
            
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Goal Description *</label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="e.g., Increase positive media coverage"
                    className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="kpi_type" className="block text-sm font-medium text-gray-300 mb-1">KPI to Track *</label>
                    <select
                        id="kpi_type"
                        value={kpiType}
                        onChange={(e) => setKpiType(e.target.value as KpiType)}
                        className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                    >
                        {KpiOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="target_value" className="block text-sm font-medium text-gray-300 mb-1">Target Value *</label>
                    <input
                        type="number"
                        id="target_value"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        required
                        placeholder="e.g., 50"
                        className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading}>
                    {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Set Goal')}
                </Button>
            </div>
        </form>
    );
};

export default NewGoalForm;