
import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { MOCK_ENGAGEMENTS } from '../data/mockData';
import { PlusCircle } from 'lucide-react';
import type { Engagement } from '../types';

const EngagementRow: React.FC<{ engagement: Engagement }> = ({ engagement }) => {
    return (
        <tr className="border-b border-usace-border hover:bg-usace-border/50">
            <td className="p-4 font-medium text-white">{engagement.date}</td>
            <td className="p-4 text-gray-300 capitalize">{engagement.type.replace(/_/g, ' ')}</td>
            <td className="p-4 text-gray-300">{engagement.audience || 'N/A'}</td>
            <td className="p-4 text-gray-300">{engagement.location || 'N/A'}</td>
            <td className="p-4 text-gray-300">{engagement.campaign}</td>
            <td className="p-4 text-gray-300">{engagement.outcomes || 'N/A'}</td>
        </tr>
    );
};


const EngagementsScreen: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Engagement Logs</h1>
                <Button Icon={PlusCircle}>Log Engagement</Button>
            </div>
            <Card>
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
                            {MOCK_ENGAGEMENTS.map(engagement => (
                                <EngagementRow key={engagement.id} engagement={engagement} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default EngagementsScreen;
