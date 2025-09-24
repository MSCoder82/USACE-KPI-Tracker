import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle, Loader } from 'lucide-react';
import type { Engagement } from '../types';

const EngagementRow: React.FC<{ engagement: Engagement }> = ({ engagement }) => {
    return (
        <tr className="border-b border-usace-border hover:bg-usace-border/50">
            <td className="p-4 font-medium text-white">{engagement.date}</td>
            <td className="p-4 text-gray-300 capitalize">{engagement.type.replace(/_/g, ' ')}</td>
            <td className="p-4 text-gray-300">{engagement.audience || 'N/A'}</td>
            <td className="p-4 text-gray-300">{engagement.location || 'N/A'}</td>
            <td className="p-4 text-gray-300">{engagement.campaigns?.name || 'N/A'}</td>
            <td className="p-4 text-gray-300">{engagement.outcomes || 'N/A'}</td>
        </tr>
    );
};

const EngagementsScreen: React.FC = () => {
    const { user } = useUser();
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Engagement Logs</h1>
                <Button Icon={PlusCircle}>Log Engagement</Button>
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
                                </tr>
                            </thead>
                            <tbody>
                                {engagements.length > 0 ? (
                                    engagements.map(engagement => (
                                        <EngagementRow key={engagement.id} engagement={engagement} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-gray-400">No engagements found.</td>
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

export default EngagementsScreen;