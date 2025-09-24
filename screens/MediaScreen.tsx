import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle, Loader } from 'lucide-react';
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
            <td className="p-4 text-gray-300">{log.campaigns?.name || 'N/A'}</td>
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
            <td className="p-4 text-gray-300">{query.profiles?.full_name || 'N/A'}</td>
        </tr>
    );
};


const MediaScreen: React.FC = () => {
    const { user } = useUser();
    const [mediaLogs, setMediaLogs] = useState<MediaLog[]>([]);
    const [mediaQueries, setMediaQueries] = useState<MediaQuery[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [queriesLoading, setQueriesLoading] = useState(true);
    const [logsError, setLogsError] = useState<string | null>(null);
    const [queriesError, setQueriesError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.team_id) return;

        const fetchMediaLogs = async () => {
            setLogsLoading(true);
            const { data, error } = await supabase
                .from('media_logs')
                .select('*, campaigns(name)')
                .eq('team_id', user.team_id)
                .order('date', { ascending: false });
            
            if (error) setLogsError(error.message);
            else setMediaLogs(data as MediaLog[] || []);
            setLogsLoading(false);
        };
        
        const fetchMediaQueries = async () => {
            setQueriesLoading(true);
            const { data, error } = await supabase
                .from('media_queries')
                .select('*, profiles!assigned_to(full_name)')
                .eq('team_id', user.team_id)
                .order('date', { ascending: false });

            if (error) setQueriesError(error.message);
            else setMediaQueries(data as MediaQuery[] || []);
            setQueriesLoading(false);
        };

        fetchMediaLogs();
        fetchMediaQueries();
    }, [user]);


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
                 {logsLoading ? (
                    <div className="flex justify-center items-center p-8"><Loader className="h-6 w-6 animate-spin text-usace-red" /></div>
                 ) : logsError ? (
                    <div className="p-4 text-center text-red-400">{`Error: ${logsError}`}</div>
                 ) : (
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
                                {mediaLogs.length > 0 ? mediaLogs.map(log => <MediaLogRow key={log.id} log={log} />) : (
                                    <tr><td colSpan={6} className="p-4 text-center text-gray-400">No media logs found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 )}
            </Card>

            <Card title="Media Queries">
                {queriesLoading ? (
                    <div className="flex justify-center items-center p-8"><Loader className="h-6 w-6 animate-spin text-usace-red" /></div>
                 ) : queriesError ? (
                    <div className="p-4 text-center text-red-400">{`Error: ${queriesError}`}</div>
                 ) : (
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
                                {mediaQueries.length > 0 ? mediaQueries.map(query => <MediaQueryRow key={query.id} query={query} />) : (
                                     <tr><td colSpan={6} className="p-4 text-center text-gray-400">No media queries found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MediaScreen;