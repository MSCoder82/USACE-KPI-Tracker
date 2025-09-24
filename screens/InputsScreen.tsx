import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { MOCK_INPUTS } from '../data/mockData';
// FIX: Replaced non-existent 'Note' icon with 'StickyNote' from lucide-react.
import { PlusCircle, Link, FileText, StickyNote } from 'lucide-react';
import type { Input } from '../types';
import { InputType } from '../types';


const InputRow: React.FC<{ input: Input }> = ({ input }) => {
    const icons: Record<InputType, React.ElementType> = {
        [InputType.LINK]: Link,
        // FIX: Replaced non-existent 'Note' icon with 'StickyNote'.
        [InputType.NOTE]: StickyNote,
        [InputType.FILE]: FileText,
        [InputType.PRODUCT]: FileText
    }
    const Icon = icons[input.type];

    return (
        <tr className="border-b border-usace-border hover:bg-usace-border/50">
            <td className="p-4 font-medium text-white flex items-center">
                <Icon className="w-4 h-4 mr-3 text-usace-gray" />
                <span>
                    {input.title}
                    {input.link_url && <a href={input.link_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline text-xs">[Link]</a>}
                </span>
            </td>
            <td className="p-4 text-gray-300 capitalize">{input.type}</td>
            <td className="p-4 text-gray-300">{input.campaign}</td>
            <td className="p-4 text-gray-300">{input.created_by}</td>
            <td className="p-4 text-gray-300">{new Date(input.created_at).toLocaleDateString()}</td>
        </tr>
    );
};


const InputsScreen: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Logged Inputs</h1>
                <Button Icon={PlusCircle}>Log Input</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-usace-card">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Campaign</th>
                                <th className="p-4">Created By</th>
                                <th className="p-4">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_INPUTS.map(input => (
                                <InputRow key={input.id} input={input} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default InputsScreen;