import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from './Button';
import { Loader } from 'lucide-react';
import type { User, Team } from '../types';
import { UserRole } from '../types';

interface EditUserFormProps {
    userToEdit: User;
    teams: Team[];
    onSuccess: (user: User) => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ userToEdit, teams, onSuccess }) => {
    const [role, setRole] = useState<UserRole>(userToEdit.role);
    const [teamId, setTeamId] = useState<string | null>(userToEdit.team_id);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from('profiles')
            .update({
                role: role,
                team_id: teamId,
            })
            .eq('id', userToEdit.id)
            .select('*, teams(id, name)')
            .single();

        setLoading(false);

        if (error) {
            setError(error.message);
        } else if (data) {
            onSuccess(data as User);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
            
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select 
                    id="role" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as UserRole)} 
                    className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                >
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="teamId" className="block text-sm font-medium text-gray-300 mb-1">Team</label>
                <select 
                    id="teamId" 
                    value={teamId || ''} 
                    onChange={(e) => setTeamId(e.target.value || null)} 
                    className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                >
                    <option value="">Unassigned</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
};

export default EditUserForm;
