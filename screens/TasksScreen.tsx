
import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { MOCK_TASKS } from '../data/mockData';
import { useUser } from '../App';
import { UserRole } from '../types';
import { PlusCircle } from 'lucide-react';
import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

const TaskRow: React.FC<{ task: Task }> = ({ task }) => {
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
            <td className="p-4 text-gray-300">{task.assignee}</td>
            <td className="p-4 text-gray-300">{task.due_date || 'N/A'}</td>
            <td className="p-4 text-gray-300">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[task.status]}`}>
                    {task.status.replace('_', ' ')}
                </span>
            </td>
            <td className={`p-4 font-semibold capitalize ${priorityClasses[task.priority!] || ''}`}>{task.priority || 'N/A'}</td>
            <td className="p-4 text-gray-300">{task.campaign}</td>
        </tr>
    );
};


const TasksScreen: React.FC = () => {
    const { hasPermission } = useUser();
    const canCreate = hasPermission([UserRole.CHIEF, UserRole.ADMIN]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Team Tasks</h1>
                {canCreate && (
                    <Button Icon={PlusCircle}>New Task</Button>
                )}
            </div>
            <Card>
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
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_TASKS.map(task => (
                                <TaskRow key={task.id} task={task} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default TasksScreen;
