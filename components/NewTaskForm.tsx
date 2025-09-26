import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import Button from './Button';
import { Loader } from 'lucide-react';
import type { Task, Campaign, User } from '../types';
import { TaskStatus, TaskPriority } from '../types';

interface NewTaskFormProps {
    onSuccess: (task: Task) => void;
    taskToEdit?: Task | null;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSuccess, taskToEdit }) => {
    const { user } = useUser();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [campaignId, setCampaignId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MED);
    
    const [campaigns, setCampaigns] = useState<Pick<Campaign, 'id' | 'name'>[]>([]);
    const [teamMembers, setTeamMembers] = useState<Pick<User, 'id' | 'full_name'>[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!taskToEdit;

    useEffect(() => {
        if (isEditMode) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setAssigneeId(taskToEdit.assignee_id || '');
            setCampaignId(taskToEdit.campaign_id || '');
            setDueDate(taskToEdit.due_date || '');
            setStatus(taskToEdit.status);
            setPriority(taskToEdit.priority || TaskPriority.MED);
        }
    }, [taskToEdit, isEditMode]);


    useEffect(() => {
        if (!user?.team_id) return;

        const fetchDropdownData = async () => {
            // Fetch campaigns
            const { data: campaignData, error: campaignError } = await supabase
                .from('campaigns')
                .select('id, name')
                .eq('team_id', user.team_id);
            
            if (campaignData) setCampaigns(campaignData);

            // Fetch team members
            const { data: memberData, error: memberError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('team_id', user.team_id);

            if (memberData) setTeamMembers(memberData);
        };

        fetchDropdownData();
    }, [user?.team_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title.trim()) {
            setError("Task title is required.");
            return;
        }

        setLoading(true);
        setError(null);

        const taskData = {
            title,
            description,
            assignee_id: assigneeId || null,
            campaign_id: campaignId || null,
            due_date: dueDate || null,
            status,
            priority,
            team_id: user.team_id,
        };

        let data: Task | null = null;
        let submissionError: any = null;

        if (isEditMode) {
            const { data: updateData, error: updateError } = await supabase
                .from('tasks')
                .update(taskData)
                .eq('id', taskToEdit.id)
                .select('*, campaigns(name), profiles!assignee_id(full_name)')
                .single();
            data = updateData;
            submissionError = updateError;
        } else {
            const { data: insertData, error: insertError } = await supabase
                .from('tasks')
                .insert(taskData)
                .select('*, campaigns(name), profiles!assignee_id(full_name)')
                .single();
            data = insertData;
            submissionError = insertError;
        }

        setLoading(false);

        if (submissionError) {
            setError(submissionError.message);
        } else if (data) {
            onSuccess(data as Task);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
            
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Task Title *</label>
                <input
                    type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required
                    className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                    id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="campaignId" className="block text-sm font-medium text-gray-300 mb-1">Campaign</label>
                    <select id="campaignId" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                        <option value="">None</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-300 mb-1">Assignee</label>
                    <select id="assigneeId" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                        <option value="">Unassigned</option>
                        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                    <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                        {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                    <input
                        type="date" id="due_date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading}>
                    {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Task')}
                </Button>
            </div>
        </form>
    );
};

export default NewTaskForm;