import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle, Loader, Pencil, Trash2 } from 'lucide-react';
import type { Engagement } from '../types';
import Modal from '../components/Modal';
import NewEngagementForm from '../components/NewEngagementForm';
import ConfirmationModal from '../components/ConfirmationModal';

const EngagementRow: React.FC<{ engagement: Engagement; onEdit: (e: Engagement) => void; onDelete: (e: Engagement) => void; }> = ({ engagement, onEdit, onDelete }) => {
    return (
        <tr className="border-b border-usace-border hover:bg-usace-border/50">
            <td className="p-4 font-medium text-white">{engagement.date}</td>
            <td className="p-4 text-gray-300 capitalize">{engagement.type.replace(/_/g, ' ')}</td>
            <td className="p-4 text-gray-300">{engagement.audience || 'N/A'}</td>
            <td className="p-4 text-gray-300">{engagement.location || 'N/A'}</td>
            <td className="p-4 text-gray-300">{engagement.campaigns?.name || 'N/A'}</td>
            <td className="p-4 text-gray-300">{engagement.outcomes || 'N/A'}</td>
            <td className="p-4 text-gray-300">
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(engagement)} className="p-1 text-gray-400 hover:text-white" title="Edit">
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(engagement)} className="p-1 text-gray-400 hover:text-usace-red" title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const EngagementsScreen: React.FC = () => {
    const { user } = useUser();
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [engagementToEdit, setEngagementToEdit] = useState<Engagement | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [engagementToDelete, setEngagementToDelete] = useState<Engagement | null>(null);


    useEffect(() => {
        const fetchEngagements = async () => {
            if (!user?.team_id) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('engagements')
                .select('*, campaigns(name)')
                .eq('team_id', user.team_id)
                .order('date', { ascending: false });

            if (error) {
                console.error("Error fetching engagements:", error);
                setError(error.message);
            } else {
                setEngagements(data as Engagement[] || []);
            }
            setLoading(false);
        };
        fetchEngagements();
    }, [user]);

    const handleNewEngagementClick = () => {
        setEngagementToEdit(null);
        setIsModalOpen(true);
    };
    
    const handleEditClick = (engagement: Engagement) => {
        setEngagementToEdit(engagement);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (engagement: Engagement) => {
        setEngagementToDelete(engagement);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (!engagementToDelete) return;

        const { error } = await supabase
            .from('engagements')
            .delete()
            .eq('id', engagementToDelete.id);
        
        if (error) {
            setError(error.message);
        } else {
            setEngagements(engagements.filter(e => e.id !== engagementToDelete.id));
        }
        setIsDeleteModalOpen(false);
        setEngagementToDelete(null);
    };

    const handleFormSuccess = (updatedEngagement: Engagement) => {
        if (engagementToEdit) {
            setEngagements(engagements.map(e => e.id === updatedEngagement.id ? updatedEngagement : e));
        } else {
            setEngagements(prev => [updatedEngagement, ...prev]);
        }
        setIsModalOpen(false);
        setEngagementToEdit(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Engagement Logs</h1>
                <Button Icon={PlusCircle} onClick={handleNewEngagementClick}>Log Engagement</Button>
            </div>
            <Card>
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <Loader className="h-6 w-6 animate-spin text-usace-red" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-400">{`Error: ${error}`}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-usace-card">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Audience</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Campaign</th>
                                    <th className="p-4">Outcomes</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {engagements.length > 0 ? (
                                    engagements.map(engagement => (
                                        <EngagementRow key={engagement.id} engagement={engagement} onEdit={handleEditClick} onDelete={handleDeleteClick} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-gray-400">No engagements found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <Modal title={engagementToEdit ? "Edit Engagement" : "Log New Engagement"} onClose={() => setIsModalOpen(false)}>
                    <NewEngagementForm onSuccess={handleFormSuccess} engagementToEdit={engagementToEdit} />
                </Modal>
            )}

             {isDeleteModalOpen && engagementToDelete && (
                 <ConfirmationModal
                    title="Delete Engagement"
                    message={`Are you sure you want to delete this engagement log? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default EngagementsScreen;