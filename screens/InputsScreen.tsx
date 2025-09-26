import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle, BarChart, MessageSquare, CheckCircle, Loader, Pencil, Trash2 } from 'lucide-react';
import type { Input } from '../types';
import { InputCategory } from '../types';
import Modal from '../components/Modal';
import LogInputForm from '../components/LogInputForm';
import ConfirmationModal from '../components/ConfirmationModal';

const InputRow: React.FC<{ input: Input; onEdit: (input: Input) => void; onDelete: (input: Input) => void; }> = ({ input, onEdit, onDelete }) => {
    const icons: Record<InputCategory, React.ElementType> = {
        [InputCategory.OUTPUT]: MessageSquare,
        [InputCategory.OUTTAKE]: BarChart,
        [InputCategory.OUTCOME]: CheckCircle,
    }
    const Icon = icons[input.category];
    const title = input.name === 'Other' ? input.custom_name : input.name;

    return (
        <tr className="border-b border-usace-border hover:bg-usace-border/50">
            <td className="p-4 font-medium text-white flex items-center">
                <Icon className="w-4 h-4 mr-3 text-usace-gray" />
                <span>{title}</span>
            </td>
            <td className="p-4 text-gray-300 capitalize">{input.category.toLowerCase()}</td>
            <td className="p-4 text-gray-300">{input.quantity ?? 'N/A'}</td>
            <td className="p-4 text-gray-300">{input.campaigns?.name || 'N/A'}</td>
            <td className="p-4 text-gray-300">{input.profiles?.full_name || 'N/A'}</td>
            <td className="p-4 text-gray-300">{new Date(input.created_at).toLocaleDateString()}</td>
            <td className="p-4 text-gray-300">
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(input)} className="p-1 text-gray-400 hover:text-white" title="Edit">
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(input)} className="p-1 text-gray-400 hover:text-usace-red" title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const InputsScreen: React.FC = () => {
    const { user } = useUser();
    const [inputs, setInputs] = useState<Input[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputToEdit, setInputToEdit] = useState<Input | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [inputToDelete, setInputToDelete] = useState<Input | null>(null);

    useEffect(() => {
        const fetchInputs = async () => {
            if (!user?.team_id) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('inputs')
                .select('*, campaigns(name), profiles!created_by(full_name)')
                .eq('team_id', user.team_id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching inputs:", error);
                setError(error.message);
            } else {
                setInputs(data as Input[] || []);
            }
            setLoading(false);
        };
        fetchInputs();
    }, [user]);

    const handleNewInputClick = () => {
        setInputToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (input: Input) => {
        setInputToEdit(input);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (input: Input) => {
        setInputToDelete(input);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!inputToDelete) return;
        const { error } = await supabase
            .from('inputs')
            .delete()
            .eq('id', inputToDelete.id);
        
        if (error) {
            setError(error.message);
        } else {
            setInputs(inputs.filter(i => i.id !== inputToDelete.id));
        }
        setIsDeleteModalOpen(false);
        setInputToDelete(null);
    };

    const handleFormSuccess = (updatedInput: Input) => {
        if (inputToEdit) {
            setInputs(inputs.map(i => i.id === updatedInput.id ? updatedInput : i));
        } else {
            setInputs(prev => [updatedInput, ...prev]);
        }
        setIsModalOpen(false);
        setInputToEdit(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Logged Inputs</h1>
                <Button Icon={PlusCircle} onClick={handleNewInputClick}>Log Input</Button>
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
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Quantity</th>
                                    <th className="p-4">Campaign</th>
                                    <th className="p-4">Created By</th>
                                    <th className="p-4">Created At</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inputs.length > 0 ? (
                                    inputs.map(input => (
                                        <InputRow key={input.id} input={input} onEdit={handleEditClick} onDelete={handleDeleteClick} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-gray-400">No inputs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <Modal title={inputToEdit ? "Edit Input" : "Log a New Input"} onClose={() => setIsModalOpen(false)}>
                    <LogInputForm onSuccess={handleFormSuccess} inputToEdit={inputToEdit} />
                </Modal>
            )}

            {isDeleteModalOpen && inputToDelete && (
                 <ConfirmationModal
                    title="Delete Input"
                    message={`Are you sure you want to delete this input? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default InputsScreen;