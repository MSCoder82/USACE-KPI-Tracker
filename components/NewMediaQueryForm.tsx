import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import Button from './Button';
import { Loader } from 'lucide-react';
import type { MediaQuery, User } from '../types';
import { MediaQueryStatus } from '../types';

interface NewMediaQueryFormProps {
    onSuccess: (query: MediaQuery) => void;
    queryToEdit?: MediaQuery | null;
}

const NewMediaQueryForm: React.FC<NewMediaQueryFormProps> = ({ onSuccess, queryToEdit }) => {
    const { user } = useUser();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [outlet, setOutlet] = useState('');
    const [topic, setTopic] = useState('');
    const [deadline, setDeadline] = useState('');
    const [status, setStatus] = useState<MediaQueryStatus>(MediaQueryStatus.NEW);
    const [assignedTo, setAssignedTo] = useState('');
    
    const [teamMembers, setTeamMembers] = useState<Pick<User, 'id' | 'full_name'>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!queryToEdit;

    useEffect(() => {
        if (isEditMode) {
            setDate(queryToEdit.date);
            setOutlet(queryToEdit.outlet);
            setTopic(queryToEdit.topic);
            setDeadline(queryToEdit.deadline ? queryToEdit.deadline.slice(0, 16) : '');
            setStatus(queryToEdit.status);
            setAssignedTo(queryToEdit.assigned_to || '');
        }
    }, [queryToEdit, isEditMode]);

    useEffect(() => {
        if (!user?.team_id) return;
        const fetchTeamMembers = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('team_id', user.team_id);
            if (data) setTeamMembers(data);
        };
        fetchTeamMembers();
    }, [user?.team_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !date || !outlet || !topic) {
            setError("Date, Outlet, and Topic are required.");
            return;
        }

        setLoading(true);
        setError(null);

        const queryData = {
            date,
            outlet,
            topic,
            deadline: deadline || null,
            status,
            assigned_to: assignedTo || null,
            team_id: user.team_id,
        };

        let data: MediaQuery | null = null;
        let submissionError: any = null;

        if (isEditMode) {
             const { data: updateData, error: updateError } = await supabase
                .from('media_queries')
                .update(queryData)
                .eq('id', queryToEdit.id)
                .select('*, profiles!assigned_to(full_name)')
                .single();
            data = updateData;
            submissionError = updateError;
        } else {
            const { data: insertData, error: insertError } = await supabase
                .from('media_queries')
                .insert(queryData)
                .select('*, profiles!assigned_to(full_name)')
                .single();
            data = insertData;
            submissionError = insertError;
        }

        setLoading(false);

        if (submissionError) {
            setError(submissionError.message);
        } else if (data) {
            onSuccess(data as MediaQuery);
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
                <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Topic *</label>
                <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} required className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                    <input type="datetime-local" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red" />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value as MediaQueryStatus)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                        {Object.values(MediaQueryStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-300 mb-1">Assign To</label>
                <select id="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red">
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
            </div>
            
            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading}>
                     {loading ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Media Query')}
                </Button>
            </div>
        </form>
    );
};

export default NewMediaQueryForm;