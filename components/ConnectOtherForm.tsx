import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import Button from './Button';
import { Loader } from 'lucide-react';

interface ConnectOtherFormProps {
    onSuccess: () => void;
}

const ConnectOtherForm: React.FC<ConnectOtherFormProps> = ({ onSuccess }) => {
    const { user } = useUser();
    const [connectionName, setConnectionName] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !connectionName.trim() || !customUrl.trim()) {
            setError("Both fields are required.");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { error: insertError } = await supabase
                .from('social_connections')
                .insert({
                    team_id: user.team_id,
                    platform: 'other',
                    connection_name: connectionName,
                    custom_url: customUrl,
                    connected_by: user.id,
                });

            if (insertError) throw insertError;
            
            onSuccess();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
            
            <div>
                <label htmlFor="connectionName" className="block text-sm font-medium text-gray-300 mb-1">Feed Name *</label>
                <input
                    type="text"
                    id="connectionName"
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                    required
                    placeholder="e.g., Local News RSS Feed"
                    className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                />
            </div>

            <div>
                <label htmlFor="customUrl" className="block text-sm font-medium text-gray-300 mb-1">Feed URL *</label>
                <input
                    type="url"
                    id="customUrl"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    required
                    placeholder="https://example.com/feed.xml"
                    className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red"
                />
            </div>
            
            <div className="flex justify-end pt-2">
                <Button type="submit" Icon={loading ? Loader : undefined} disabled={loading}>
                    {loading ? 'Connecting...' : 'Connect Feed'}
                </Button>
            </div>
        </form>
    );
};

export default ConnectOtherForm;
