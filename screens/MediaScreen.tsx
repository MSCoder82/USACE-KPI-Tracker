
import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { MOCK_MEDIA_LOGS, MOCK_MEDIA_QUERIES } from '../data/mockData';
import { PlusCircle } from 'lucide-react';
import type { MediaLog, MediaQuery } from '../types';
import { Sentiment, MediaQueryStatus } from '../types';

const MediaLogRow: React.FC<{ log: MediaLog }> = ({ log }) => {
    const sentimentClasses: Record<Sentiment, string> = {
        [Sentiment.POSITIVE]: 'text-green-400',
        [Sentiment.NEUTRAL]: 'text-gray-400',
        [Sentiment.NEGATIVE]: 'text-red-400',
    };

    return (
        <tr className="border-b border-usace-border hover:bg-usace-border/50">
            <td className="p-4 font-medium text-white">{log.date}</td>
            <td className="p-4 text-gray-300">{log.outlet}</td>
            <td className="p-4 text-gray-300">{log.headline}</td>
            <td className={`p-4 capitalize font-semibold ${sentimentClasses[log.sentiment!] || ''}`}>{log.sentiment}</td>
            <td className="p-4 text-gray-300">{log.reach?.toLocaleString() || 'N/A'}</td>
            <td className="p-4 text-gray-300">{log.campaign}</td>
        </tr>
    );
};

const MediaQueryRow: React.FC<{ query: MediaQuery }> = ({ query }) => {
    const statusClasses: Record<MediaQueryStatus, string> = {
        [MediaQueryStatus.NEW]: 'bg-blue-500/20 text-blue-400',
        [MediaQueryStatus.ASSIGNED]: 'bg-yellow-500/20 text-yellow-400',
        [MediaQueryStatus.ANSWERED]: 'bg-green-500/20 text-green-400',
        [MediaQueryStatus.CLOSED]: 'bg-gray-500/20 text-gray-400',
    };

    return (
        <tr className="border-b border-usace-border hover:bg-usace-border/50">
            <td className="p-4 font-medium text-white">{query.date}</td>
            <td className="p-4 text-gray-300">{query.outlet}</td>
            <td className="p-4 text-gray-300">{query.topic}</td>
            <td className="p-4 text-gray-300">{query.deadline ? new Date(query.deadline).toLocaleString() : 'N/A'}</td>
             <td className="p-4 text-gray-300">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[query.status]}`}>
                    {query.status}
                </span>
            </td>
            <td className="p-4 text-gray-300">{query.assigned_to || 'N/A'}</td>
        </tr>
    );
};


const MediaScreen: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Media Logs & Queries</h1>
                <div className="space-x-2">
                    <Button Icon={PlusCircle} variant="secondary">Add Media Log</Button>
                    <Button Icon={PlusCircle}>Add Media Query</Button>
                </div>
            </div>

            <Card title="Media Coverage">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-usace-card">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Outlet</th>
                                <th className="p-4">Headline</th>
                                <th className="p-4">Sentiment</th>
                                <th className="p-4">Reach</th>
                                <th className="p-4">Campaign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_MEDIA_LOGS.map(log => <MediaLogRow key={log.id} log={log} />)}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Media Queries">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-usace-card">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Outlet</th>
                                <th className="p-4">Topic</th>
                                <th className="p-4">Deadline</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Assigned To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_MEDIA_QUERIES.map(query => <MediaQueryRow key={query.id} query={query} />)}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default MediaScreen;
