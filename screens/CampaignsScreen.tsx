import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { UserRole } from '../types';
import { PlusCircle, Search, Loader } from 'lucide-react';
import type { Campaign } from '../types';
import { CampaignStatus } from '../types';
import { supabase } from '../lib/supabaseClient';


const CampaignRow: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const statusClasses: Record<CampaignStatus, string> = {
        [CampaignStatus.ACTIVE]: 'bg-green-500/20 text-green-400',
        [CampaignStatus.PLANNED]: 'bg-blue-500/20 text-blue-400',
        [CampaignStatus.PAUSED]: 'bg-yellow-500/20 text-yellow-400',
        [CampaignStatus.COMPLETE]: 'bg-gray-500/20 text-gray-400',
    };

    return (
        <tr className="border-b border-usace-border hover:bg-usace-border/50">
            <td className="p-4 font-medium text-white">{campaign.name}</td>
            <td className="p-4 text-gray-300">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[campaign.status]}`}>
                    {campaign.status}
                </span>
            </td>
            <td className="p-4 text-gray-300">{campaign.start_date || 'N/A'}</td>
            <td className="p-4 text-gray-300">{campaign.end_date || 'N/A'}</td>
            <td className="p-4 text-gray-300">John Public</td>
        </tr>
    )
};


const CampaignsScreen: React.FC = () => {
    const { user, hasPermission } = useUser();
    const canCreate = hasPermission([UserRole.CHIEF, UserRole.ADMIN]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCampaigns = async () => {
            if (!user?.team_id) {
                setError("User team not found.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('team_id', user.team_id);

            if (error) {
                setError(error.message);
                console.error("Error fetching campaigns:", error);
            } else {
                setCampaigns(data as Campaign[] || []);
            }
            setLoading(false);
        };

        fetchCampaigns();
    }, [user?.team_id]);

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Team Campaigns</h1>
                {canCreate && (
                    <Button Icon={PlusCircle}>New Campaign</Button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by campaign name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-usace-card border border-usace-border rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-usace-red"
                    aria-label="Search campaigns"
                />
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
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Start Date</th>
                                    <th className="p-4">End Date</th>
                                    <th className="p-4">Owner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCampaigns.length > 0 ? (
                                    filteredCampaigns.map(campaign => (
                                        <CampaignRow key={campaign.id} campaign={campaign} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-400">No campaigns found.</td>
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

export default CampaignsScreen;