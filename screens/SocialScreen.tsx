import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { supabase } from '../lib/supabaseClient';
import { Link, PlusCircle, RefreshCw, Loader, Trash2, Edit } from 'lucide-react';
import type { SocialConnection, SocialPost } from '../types';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import ConnectOtherForm from '../components/ConnectOtherForm';

const SocialScreen: React.FC = () => {
    const { user } = useUser();
    const [connections, setConnections] = useState<SocialConnection[]>([]);
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'other' | null>(null);

    const fetchConnections = useCallback(async () => {
        if (!user?.team_id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('social_connections')
            .select('*, profiles!connected_by(full_name)')
            .eq('team_id', user.team_id);

        if (data) {
            setConnections(data as SocialConnection[]);
            if (data.length > 0 && !selectedConnectionId) {
                setSelectedConnectionId(data[0].id);
            }
        }
        setLoading(false);
    }, [user, selectedConnectionId]);

    const fetchPosts = useCallback(async () => {
        if (!selectedConnectionId) {
            setPosts([]);
            return;
        };
        const { data } = await supabase
            .from('social_posts')
            .select('*')
            .eq('connection_id', selectedConnectionId)
            .order('posted_at', { ascending: false });
        
        if (data) {
            setPosts(data as SocialPost[]);
        }
    }, [selectedConnectionId]);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleConnectTwitter = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'twitter',
            options: {
                redirectTo: window.location.href, // Redirect back here after auth
            },
        });
        if (error) console.error("Error connecting to Twitter:", error);
    };

    const handleSync = async (connection: SocialConnection) => {
        if (connection.platform !== 'twitter') {
            alert("Sync is only available for Twitter connections at this time.");
            return;
        }
        setSyncing(true);
        try {
            const { error } = await supabase.functions.invoke('sync-twitter-posts', {
                body: { connection_id: connection.id },
            });
            if (error) throw error;
            // Refresh posts after sync
            fetchPosts();
        } catch (error) {
            console.error('Error syncing posts:', error);
        } finally {
            setSyncing(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Social Command Center</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="Team Connections">
                        <div className="space-y-4">
                           <div className="space-y-2">
                                {connections.map(conn => (
                                    <div key={conn.id} className="p-3 bg-usace-border rounded-md">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-white">{conn.connection_name}</p>
                                                <p className="text-xs text-gray-400 capitalize">{conn.platform}</p>
                                            </div>
                                            {conn.platform === 'twitter' && (
                                                 <Button size="sm" variant="secondary" onClick={() => handleSync(conn)} disabled={syncing} Icon={syncing ? Loader : RefreshCw}>
                                                    {syncing ? '' : 'Sync'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                           </div>
                            <div className="pt-4 border-t border-usace-border">
                                <p className="text-sm font-semibold mb-2 text-gray-300">Add New Connection</p>
                                <div className="space-y-2">
                                    <Button onClick={handleConnectTwitter} className="w-full" variant="secondary">Connect X (Twitter)</Button>
                                    <Button onClick={() => { setModalType('other'); setIsModalOpen(true); }} className="w-full" variant="secondary">Connect Other Feed</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-semibold text-white">Feed</h3>
                             <select 
                                value={selectedConnectionId || ''}
                                onChange={(e) => setSelectedConnectionId(e.target.value)}
                                className="bg-usace-card border border-usace-border rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-usace-red"
                            >
                                {connections.map(c => <option key={c.id} value={c.id}>{c.connection_name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                           {posts.length > 0 ? posts.map(post => (
                               <div key={post.id} className="p-4 bg-usace-border rounded-lg">
                                   <div className="flex items-start space-x-3">
                                       <img src={post.author_avatar_url} alt={post.author_name} className="w-10 h-10 rounded-full"/>
                                       <div>
                                           <div className="flex items-baseline space-x-2">
                                                <p className="font-bold text-white">{post.author_name}</p>
                                                <p className="text-sm text-gray-400">@{post.author_handle}</p>
                                                <p className="text-xs text-gray-500">&middot; {new Date(post.posted_at).toLocaleDateString()}</p>
                                           </div>
                                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{post.post_text}</p>
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                                <span>Likes: {post.metrics.likes || 0}</span>
                                                <span>Replies: {post.metrics.replies || 0}</span>
                                                <span>Retweets: {post.metrics.retweets || 0}</span>
                                                <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View on {post.platform}</a>
                                            </div>
                                       </div>
                                   </div>
                               </div>
                           )) : (
                               <div className="text-center py-16 text-gray-400">
                                   <p>No posts to display for this connection.</p>
                                   <p className="text-sm">Try syncing the feed or selecting another connection.</p>
                               </div>
                           )}
                        </div>
                    </Card>
                </div>
            </div>

            {isModalOpen && modalType === 'other' && (
                <Modal title="Connect Other Feed" onClose={() => setIsModalOpen(false)}>
                    <ConnectOtherForm onSuccess={() => { setIsModalOpen(false); fetchConnections(); }} />
                </Modal>
            )}
        </div>
    );
};

export default SocialScreen;
