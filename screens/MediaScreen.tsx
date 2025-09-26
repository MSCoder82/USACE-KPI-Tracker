import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle, Loader, Pencil, Trash2 } from 'lucide-react';
import type { MediaLog, MediaQuery } from '../types';
import { Sentiment, MediaQueryStatus } from '../types';
import Modal from '../components/Modal';
import NewMediaLogForm from '../components/NewMediaLogForm';
import NewMediaQueryForm from '../components/NewMediaQueryForm';
import ConfirmationModal from '../components/ConfirmationModal';

const MediaLogRow: React.FC<{ log: MediaLog; onEdit: (log: MediaLog) => void; onDelete: (log: MediaLog) => void; }> = ({ log, onEdit, onDelete }) => {
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
            <td className="p-4 text-gray-300">
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(log)} className="p-1 text-gray-400 hover:text-white" title="Edit">
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(log)} className="p-1 text-gray-400 hover:text-usace-red" title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const MediaQueryRow: React.FC<{ query: MediaQuery; onEdit: (query: MediaQuery) => void; onDelete: (query: MediaQuery) => void; }> = ({ query, onEdit, onDelete }) => {
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
            <td className="p-4 text-gray-300">
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(query)} className="p-1 text-gray-400 hover:text-white" title="Edit">
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(query)} className="p-1 text-gray-400 hover:text-usace-red" title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
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
    
    // State for Media Log Modals
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [logToEdit, setLogToEdit] = useState<MediaLog | null>(null);
    const [isDeleteLogModalOpen, setIsDeleteLogModalOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState<MediaLog | null>(null);

    // State for Media Query Modals
    const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
    const [queryToEdit, setQueryToEdit] = useState<MediaQuery | null>(null);
    const [isDeleteQueryModalOpen, setIsDeleteQueryModalOpen] = useState(false);
    const [queryToDelete, setQueryToDelete] = useState<MediaQuery | null>(null);

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

    // --- Media Log Handlers ---
    const handleNewLogClick = () => {
        setLogToEdit(null);
        setIsLogModalOpen(true);
    };
    const handleEditLogClick = (log: MediaLog) => {
        setLogToEdit(log);
        setIsLogModalOpen(true);
    };
    const handleDeleteLogClick = (log: MediaLog) => {
        setLogToDelete(log);
        setIsDeleteLogModalOpen(true);
    };
    const handleConfirmDeleteLog = async () => {
        if (!logToDelete) return;
        const { error } = await supabase.from('media_logs').delete().eq('id', logToDelete.id);
        if (error) setLogsError(error.message);
        else setMediaLogs(mediaLogs.filter(l => l.id !== logToDelete.id));
        setIsDeleteLogModalOpen(false);
        setLogToDelete(null);
    };
    const handleLogFormSuccess = (updatedLog: MediaLog) => {
        if (logToEdit) {
            setMediaLogs(mediaLogs.map(l => l.id === updatedLog.id ? updatedLog : l));
        } else {
            setMediaLogs(prev => [updatedLog, ...prev]);
        }
        setIsLogModalOpen(false);
        setLogToEdit(null);
    };

    // --- Media Query Handlers ---
    const handleNewQueryClick = () => {
        setQueryToEdit(null);
        setIsQueryModalOpen(true);
    };
    const handleEditQueryClick = (query: MediaQuery) => {
        setQueryToEdit(query);
        setIsQueryModalOpen(true);
    };
    const handleDeleteQueryClick = (query: MediaQuery) => {
        setQueryToDelete(query);
        setIsDeleteQueryModalOpen(true);
    };
    const handleConfirmDeleteQuery = async () => {
        if (!queryToDelete) return;
        const { error } = await supabase.from('media_queries').delete().eq('id', queryToDelete.id);
        if (error) setQueriesError(error.message);
        else setMediaQueries(mediaQueries.filter(q => q.id !== queryToDelete.id));
        setIsDeleteQueryModalOpen(false);
        setQueryToDelete(null);
    };
    const handleQueryFormSuccess = (updatedQuery: MediaQuery) => {
        if (queryToEdit) {
            setMediaQueries(mediaQueries.map(q => q.id === updatedQuery.id ? updatedQuery : q));
        } else {
            setMediaQueries(prev => [updatedQuery, ...prev]);
        }
        setIsQueryModalOpen(false);
        setQueryToEdit(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Media Logs & Queries</h1>
                <div className="space-x-2">
                    <Button Icon={PlusCircle} variant="secondary" onClick={handleNewLogClick}>Add Media Log</Button>
                    <Button Icon={PlusCircle} onClick={handleNewQueryClick}>Add Media Query</Button>
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
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mediaLogs.length > 0 ? mediaLogs.map(log => <MediaLogRow key={log.id} log={log} onEdit={handleEditLogClick} onDelete={handleDeleteLogClick} />) : (
                                    <tr><td colSpan={7} className="p-4 text-center text-gray-400">No media logs found.</td></tr>
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
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mediaQueries.length > 0 ? mediaQueries.map(query => <MediaQueryRow key={query.id} query={query} onEdit={handleEditQueryClick} onDelete={handleDeleteQueryClick} />) : (
                                     <tr><td colSpan={7} className="p-4 text-center text-gray-400">No media queries found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
            
            {isLogModalOpen && (
                <Modal title={logToEdit ? "Edit Media Log" : "Add Media Log"} onClose={() => setIsLogModalOpen(false)}>
                    <NewMediaLogForm onSuccess={handleLogFormSuccess} logToEdit={logToEdit} />
                </Modal>
            )}

            {isQueryModalOpen && (
                <Modal title={queryToEdit ? "Edit Media Query" : "Add Media Query"} onClose={() => setIsQueryModalOpen(false)}>
                    <NewMediaQueryForm onSuccess={handleQueryFormSuccess} queryToEdit={queryToEdit} />
                </Modal>
            )}

            {isDeleteLogModalOpen && logToDelete && (
                <ConfirmationModal 
                    title="Delete Media Log"
                    message={`Are you sure you want to delete the log from "${logToDelete.outlet}"? This action cannot be undone.`}
                    onConfirm={handleConfirmDeleteLog}
                    onCancel={() => setIsDeleteLogModalOpen(false)}
                />
            )}

            {isDeleteQueryModalOpen && queryToDelete && (
                <ConfirmationModal 
                    title="Delete Media Query"
                    message={`Are you sure you want to delete the query from "${queryToDelete.outlet}"? This action cannot be undone.`}
                    onConfirm={handleConfirmDeleteQuery}
                    onCancel={() => setIsDeleteQueryModalOpen(false)}
                />
            )}
        </div>
    );
};

export default MediaScreen;