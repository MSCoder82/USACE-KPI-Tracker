import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle, Link, FileText, StickyNote, Loader } from 'lucide-react';
import type { Input } from '../types';
import { InputType } from '../types';

const InputRow: React.FC<{ input: Input }> = ({ input }) => {
    const icons: Record<InputType, React.ElementType> = {
        [InputType.LINK]: Link,
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
            <td className="p-4 text-gray-300">{input.campaigns?.name || 'N/A'}</td>
            <td className="p-4 text-gray-300">{input.profiles?.full_name || 'N/A'}</td>
            <td className="p-4 text-gray-300">{new Date(input.created_at).toLocaleDateString()}</td>
        </tr>
    );
};

const InputsScreen: React.FC = () => {
    const { user } = useUser();
    const [inputs, setInputs] = useState<Input[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Logged Inputs</h1>
                <Button Icon={PlusCircle}>Log Input</Button>
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
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Campaign</th>
                                    <th className="p-4">Created By</th>
                                    <th className="p-4">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inputs.length > 0 ? (
                                    inputs.map(input => (
                                        <InputRow key={input.id} input={input} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-400">No inputs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default InputsScreen;