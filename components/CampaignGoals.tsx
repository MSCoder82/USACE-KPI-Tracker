import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Campaign, Goal, GoalProgress } from '../types';
import { useUser } from '../App';
import { Loader, Pencil, Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import NewGoalForm from './NewGoalForm';

interface CampaignGoalsProps {
    campaign: Campaign;
    onBack: () => void;
}

const GoalProgressBar: React.FC<{ goal: GoalProgress; onEdit: () => void; onDelete: () => void; }> = ({ goal, onEdit, onDelete }) => {
    const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
    return (
        <div className="p-4 bg-usace-border rounded-lg">
            <div className="flex justify-between items-start mb-1">
                 <div>
                    <p className="font-semibold text-white">{goal.description}</p>
                    <p className="text-xs text-gray-400">Target: {goal.target_value.toLocaleString()}</p>
                 </div>
                 <div className="flex items-center space-x-2">
                     <button onClick={onEdit} className="p-1 text-gray-400 hover:text-white"><Pencil className="h-4 w-4" /></button>
                     <button onClick={onDelete} className="p-1 text-gray-400 hover:text-usace-red"><Trash2 className="h-4 w-4" /></button>
                 </div>
            </div>
             <div className="flex items-center gap-4">
                <div className="w-full bg-usace-card rounded-full h-3">
                    <div className="bg-usace-red h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                 <span className="text-sm font-bold text-white whitespace-nowrap">{goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()}</span>
             </div>
        </div>
    )
};


const CampaignGoals: React.FC<CampaignGoalsProps> = ({ campaign, onBack }) => {
    const { user } = useUser();
    const [goals, setGoals] = useState<GoalProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<GoalProgress | null>(null);

    const fetchGoals = useCallback(async () => {
        if (!user?.team_id) return;
        setLoading(true);

        const { data, error } = await supabase.rpc('get_all_goal_progress', { team_id_param: user.team_id });

        if (error) {
            setError(error.message);
        } else if (data) {
            setGoals(data.filter(g => g.campaign_name === campaign.name) as GoalProgress[]);
        }
        setLoading(false);
    }, [user, campaign.name]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);
    
    const handleNewGoalClick = () => {
        setGoalToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (goalProgress: GoalProgress) => {
        // We need the raw Goal object for the form, not the GoalProgress
        const originalGoal: Goal = {
            id: goalProgress.goal_id,
            description: goalProgress.description,
            kpi_type: goalProgress.kpi_type,
            target_value: goalProgress.target_value,
            campaign_id: campaign.id,
            team_id: user!.team_id!,
            created_at: '', // Not needed for edit form
        };
        setGoalToEdit(originalGoal);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = (goal: GoalProgress) => {
        setGoalToDelete(goal);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (!goalToDelete) return;
        const { error } = await supabase.from('goals').delete().eq('id', goalToDelete.goal_id);
        if (error) setError(error.message);
        else fetchGoals(); // Re-fetch to update the list
        setIsDeleteModalOpen(false);
        setGoalToDelete(null);
    };

    const handleFormSuccess = () => {
        fetchGoals(); // Re-fetch to see the new/updated goal
        setIsModalOpen(false);
        setGoalToEdit(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Button variant="secondary" onClick={onBack} className="p-2 h-10 w-10">
                    <ArrowLeft className="h-5 w-5" />
                 </Button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Manage Goals</h1>
                    <p className="text-gray-400">For Campaign: {campaign.name}</p>
                </div>
            </div>

            <Card
                title="Campaign Goals"
                action={
                    <Button Icon={PlusCircle} onClick={handleNewGoalClick}>
                        Add Goal
                    </Button>
                }
            >
                {loading ? <div className="flex justify-center p-8"><Loader className="animate-spin h-6 w-6 text-usace-red" /></div> :
                 error ? <div className="p-4 text-center text-red-400">{`Error: ${error}`}</div> :
                 (
                    <div className="space-y-4">
                        {goals.length > 0 ? (
                            goals.map(goal => (
                                <GoalProgressBar key={goal.goal_id} goal={goal} onEdit={() => handleEditClick(goal)} onDelete={() => handleDeleteClick(goal)} />
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-8">No goals have been set for this campaign yet.</p>
                        )}
                    </div>
                 )}
            </Card>

            {isModalOpen && (
                <Modal title={goalToEdit ? "Edit Goal" : "Create New Goal"} onClose={() => setIsModalOpen(false)}>
                    <NewGoalForm 
                        onSuccess={handleFormSuccess}
                        campaignId={campaign.id}
                        goalToEdit={goalToEdit}
                    />
                </Modal>
            )}

            {isDeleteModalOpen && goalToDelete && (
                 <ConfirmationModal
                    title="Delete Goal"
                    message={`Are you sure you want to delete the goal: "${goalToDelete.description}"? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default CampaignGoals;