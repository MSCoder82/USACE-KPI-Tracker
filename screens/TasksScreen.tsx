import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { supabase } from '../lib/supabaseClient';
import { UserRole } from '../types';
import { PlusCircle, Loader, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';
import Modal from '../components/Modal';
import NewTaskForm from '../components/NewTaskForm';
import ConfirmationModal from '../components/ConfirmationModal';

const TaskRow: React.FC<{ task: Task; onEdit: (task: Task) => void; onDelete: (task: Task) => void; }> = ({ task, onEdit, onDelete }) => {
    const statusClasses: Record<TaskStatus, string> = {
        [TaskStatus.TODO]: 'bg-gray-500/20 text-gray-400',
        [TaskStatus.IN_PROGRESS]: 'bg-blue-500/20 text-blue-400',
        [TaskStatus.BLOCKED]: 'bg-red-500/20 text-red-400',
        [TaskStatus.DONE]: 'bg-green-500/20 text-green-400',
    };
    
    const priorityClasses: Record<TaskPriority, string> = {
        [TaskPriority.LOW]: 'text-gray-400',
        [TaskPriority.MED]: 'text-yellow-400',
        [TaskPriority.HIGH]: 'text-orange-400',
        [TaskPriority.URGENT]: 'text-red-500',
    };

    return (
        <tr className="border-b border-usace-border hover:bg-usace-border/50">
            <td className="p-4 font-medium text-white">{task.title}</td>
            <td className="p-4 text-gray-300">{task.profiles?.full_name || 'N/A'}</td>
            <td className="p-4 text-gray-300">{task.due_date || 'N/A'}</td>
            <td className="p-4 text-gray-300">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[task.status]}`}>
                    {task.status.replace('_', ' ')}
                </span>
            </td>
            <td className={`p-4 font-semibold capitalize ${priorityClasses[task.priority!] || ''}`}>{task.priority || 'N/A'}</td>
            <td className="p-4 text-gray-300">{task.campaigns?.name || 'N/A'}</td>
            <td className="p-4 text-gray-300">
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-white" title="Edit">
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(task)} className="p-1 text-gray-400 hover:text-usace-red" title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};


const TasksScreen: React.FC = () => {
    const { user, hasPermission } = useUser();
    const canCreate = hasPermission([UserRole.CHIEF, UserRole.ADMIN]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);


    useEffect(() => {
        const fetchTasks = async () => {
            if (!user?.team_id) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select('*, campaigns(name), profiles!assignee_id(full_name)')
                .eq('team_id', user.team_id)
                .order('due_date', { ascending: true, nullsFirst: false });

            if (error) {
                console.error("Error fetching tasks:", error);
                setError(error.message);
            } else {
                setTasks(data as Task[] || []);
            }
            setLoading(false);
        };
        fetchTasks();
    }, [user]);
    
    const handleNewTaskClick = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = (task: Task) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskToDelete.id);
        
        if (error) {
            setError(error.message);
        } else {
            setTasks(tasks.filter(t => t.id !== taskToDelete.id));
        }
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
    };

    const handleFormSuccess = (updatedTask: Task) => {
        if (taskToEdit) {
            setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        } else {
            setTasks(prevTasks => [updatedTask, ...prevTasks]);
        }
        setIsModalOpen(false);
        setTaskToEdit(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Team Tasks</h1>
                {canCreate && (
                    <Button Icon={PlusCircle} onClick={handleNewTaskClick}>New Task</Button>
                )}
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
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Assignee</th>
                                    <th className="p-4">Due Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Priority</th>
                                    <th className="p-4">Campaign</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <TaskRow key={task.id} task={task} onEdit={handleEditClick} onDelete={handleDeleteClick}/>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-gray-400">No tasks found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
            {isModalOpen && (
                <Modal title={taskToEdit ? "Edit Task" : "Create New Task"} onClose={() => setIsModalOpen(false)}>
                    <NewTaskForm onSuccess={handleFormSuccess} taskToEdit={taskToEdit} />
                </Modal>
            )}
            {isDeleteModalOpen && taskToDelete && (
                 <ConfirmationModal
                    title="Delete Task"
                    message={`Are you sure you want to delete the task "${taskToDelete.title}"? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default TasksScreen;