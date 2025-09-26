import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, Team } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import { Loader, Users, Shield, Edit, PlusCircle } from 'lucide-react';
import Modal from '../components/Modal';
import EditUserForm from '../components/EditUserForm';

const AdminScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newTeamName, setNewTeamName] = useState('');

    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersRes, teamsRes] = await Promise.all([
                supabase.from('profiles').select('*, teams(id, name)'),
                supabase.from('teams').select('*')
            ]);
            
            if (usersRes.error) throw usersRes.error;
            if (teamsRes.error) throw teamsRes.error;

            setUsers(usersRes.data as User[]);
            setTeams(teamsRes.data as Team[]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEditUserClick = (user: User) => {
        setUserToEdit(user);
        setIsEditUserModalOpen(true);
    };

    const handleUserUpdateSuccess = (updatedUser: User) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setIsEditUserModalOpen(false);
        setUserToEdit(null);
    };

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        const { data, error } = await supabase
            .from('teams')
            .insert({ name: newTeamName })
            .select()
            .single();

        if (error) {
            setError(error.message);
        } else if (data) {
            setTeams(prev => [...prev, data]);
            setNewTeamName('');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>

            <div className="border-b border-usace-border">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-usace-red text-usace-red' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                        User Management
                    </button>
                    <button onClick={() => setActiveTab('teams')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'teams' ? 'border-usace-red text-usace-red' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                        Team Management
                    </button>
                </nav>
            </div>

            {loading ? <div className="flex justify-center p-8"><Loader className="animate-spin h-8 w-8 text-usace-red" /></div> :
             error ? <div className="p-4 text-center text-red-400">{`Error: ${error}`}</div> :
             (
                <div>
                    {activeTab === 'users' && (
                        <Card title="All Users">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                     <thead className="text-xs text-gray-400 uppercase bg-usace-card">
                                        <tr>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Team</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} className="border-b border-usace-border hover:bg-usace-border/50">
                                                <td className="p-4 font-medium text-white">{user.full_name}</td>
                                                <td className="p-4 text-gray-300">{user.email}</td>
                                                <td className="p-4 text-gray-300 capitalize">{user.role}</td>
                                                <td className="p-4 text-gray-300">{user.teams?.name || 'Unassigned'}</td>
                                                <td className="p-4">
                                                    <button onClick={() => handleEditUserClick(user)} className="p-1 text-gray-400 hover:text-white" title="Edit User">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                    {activeTab === 'teams' && (
                         <Card title="All Teams">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-white">Existing Teams</h3>
                                    <ul className="space-y-2">
                                        {teams.map(team => (
                                            <li key={team.id} className="p-3 bg-usace-border rounded-md text-gray-200">{team.name}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-white">Add New Team</h3>
                                    <form onSubmit={handleAddTeam} className="space-y-3">
                                        <div>
                                            <label htmlFor="teamName" className="sr-only">Team Name</label>
                                            <input 
                                                type="text" 
                                                id="teamName"
                                                value={newTeamName}
                                                onChange={(e) => setNewTeamName(e.target.value)}
                                                placeholder="New team name"
                                                className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                                            />
                                        </div>
                                        <Button type="submit" Icon={PlusCircle} className="w-full">Add Team</Button>
                                    </form>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
             )}
            
            {isEditUserModalOpen && userToEdit && (
                <Modal title={`Edit ${userToEdit.full_name}`} onClose={() => setIsEditUserModalOpen(false)}>
                    <EditUserForm 
                        userToEdit={userToEdit}
                        teams={teams}
                        onSuccess={handleUserUpdateSuccess}
                    />
                </Modal>
            )}
        </div>
    );
};

export default AdminScreen;
