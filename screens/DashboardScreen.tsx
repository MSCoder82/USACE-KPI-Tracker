import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import Card from '../components/Card';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../App';
import type { Input, Task, Campaign, GoalProgress } from '../types';
import { InputCategory } from '../types';
import { Loader, FileText, CheckSquare } from 'lucide-react';

const COLORS = {
    [InputCategory.OUTPUT]: '#3B82F6', // blue-500
    [InputCategory.OUTTAKE]: '#F59E0B', // amber-500
    [InputCategory.OUTCOME]: '#10B981', // emerald-500
};

const GoalProgressBar: React.FC<{ goal: GoalProgress }> = ({ goal }) => {
    const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                 <div>
                    <p className="font-semibold text-white text-sm">{goal.description}</p>
                    <p className="text-xs text-gray-400">{goal.campaign_name}</p>
                 </div>
                 <span className="text-sm font-bold text-white">{goal.current_value.toLocaleString()} / <span className="text-gray-400">{goal.target_value.toLocaleString()}</span></span>
            </div>
            <div className="w-full bg-usace-border rounded-full h-2.5">
                <div className="bg-usace-red h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    )
};

const DashboardScreen: React.FC = () => {
    const { user } = useUser();
    const [recentInputs, setRecentInputs] = useState<Input[]>([]);
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<{ name: string; count: number }[]>([]);
    const [campaignsForFilter, setCampaignsForFilter] = useState<Pick<Campaign, 'id' | 'name'>[]>([]);
    const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);

    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
    const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.team_id) return;
        const fetchCampaigns = async () => {
            const { data } = await supabase
                .from('campaigns')
                .select('id, name')
                .eq('team_id', user.team_id)
                .order('name', { ascending: true });
            if (data) setCampaignsForFilter(data);
        };
        fetchCampaigns();
    }, [user]);

    const fetchDashboardData = useCallback(async () => {
        if (!user?.team_id) return;
        setLoading(true);

        // Fetch Goal Progress
        let goalsRpc = supabase.rpc('get_all_goal_progress', { team_id_param: user.team_id });
        if(selectedCampaign !== 'all') {
            // This is a bit tricky with RPC, we filter client side for simplicity.
            // A more advanced RPC could take campaign_id as a parameter.
        }
        const { data: goalsData } = await goalsRpc;
        let filteredGoals = goalsData || [];
        if (selectedCampaign !== 'all' && goalsData) {
            filteredGoals = goalsData.filter(g => g.campaign_name === campaignsForFilter.find(c => c.id === selectedCampaign)?.name);
        }
        setGoalProgress(filteredGoals as GoalProgress[]);


        const getDateFilter = () => {
            const now = new Date();
            if (selectedDateRange === '7d') {
                now.setDate(now.getDate() - 7);
                return now.toISOString();
            }
            if (selectedDateRange === '30d') {
                now.setDate(now.getDate() - 30);
                return now.toISOString();
            }
             if (selectedDateRange === '90d') {
                now.setDate(now.getDate() - 90);
                return now.toISOString();
            }
            return null;
        };

        const dateFilter = getDateFilter();

        // Fetch Recent Inputs
        let inputsQuery = supabase
            .from('inputs')
            .select('*, profiles!created_by(full_name)')
            .eq('team_id', user.team_id);
        if (selectedCampaign !== 'all') inputsQuery = inputsQuery.eq('campaign_id', selectedCampaign);
        if (dateFilter) inputsQuery = inputsQuery.gte('created_at', dateFilter);
        const { data: inputsData } = await inputsQuery.order('created_at', { ascending: false }).limit(5);
        if (inputsData) setRecentInputs(inputsData as Input[]);
        
        // Fetch Recent Tasks
        let tasksQuery = supabase
            .from('tasks')
            .select('*')
            .eq('team_id', user.team_id);
        if (selectedCampaign !== 'all') tasksQuery = tasksQuery.eq('campaign_id', selectedCampaign);
        if (dateFilter) tasksQuery = tasksQuery.gte('created_at', dateFilter);
        const { data: tasksData } = await tasksQuery.order('created_at', { ascending: false }).limit(5);
        if (tasksData) setRecentTasks(tasksData as Task[]);

        // Fetch and Aggregate Category Counts for Chart
        let chartQuery = supabase
            .from('inputs')
            .select('category')
            .eq('team_id', user.team_id);
        if (selectedCampaign !== 'all') chartQuery = chartQuery.eq('campaign_id', selectedCampaign);
        if (dateFilter) chartQuery = chartQuery.gte('created_at', dateFilter);
        const { data: allInputs } = await chartQuery;

        if (allInputs) {
            const counts = allInputs.reduce((acc, input) => {
                acc[input.category] = (acc[input.category] || 0) + 1;
                return acc;
            }, {} as Record<InputCategory, number>);

            const chartData = [
                { name: 'Outputs', count: counts.OUTPUT || 0 },
                { name: 'Outtakes', count: counts.OUTTAKE || 0 },
                { name: 'Outcomes', count: counts.OUTCOME || 0 },
            ];
            setCategoryCounts(chartData);
        }

        setLoading(false);
    }, [user, selectedCampaign, selectedDateRange, campaignsForFilter]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Team KPI Overview</h1>
                <div className="flex items-center space-x-2">
                     <select 
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="bg-usace-card border border-usace-border rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-usace-red"
                    >
                        <option value="all">All Campaigns</option>
                        {campaignsForFilter.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="bg-usace-card border border-usace-border rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-usace-red"
                    >
                        <option value="all">All Time</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>
            </div>

            <Card title="Campaign Goal Progress">
                {loading ? (
                    <div className="flex justify-center items-center h-full py-10"><Loader className="animate-spin h-6 w-6 text-usace-red" /></div>
                ) : (
                    <div className="space-y-4">
                        {goalProgress.length > 0 ? goalProgress.map(goal => (
                           <GoalProgressBar key={goal.goal_id} goal={goal} />
                        )) : <p className="text-center text-gray-400 py-4">No goals match the current filters. Set goals in the Campaigns screen.</p>}
                    </div>
                )}
            </Card>

            <Card title="Inputs by Category">
                <div style={{ width: '100%', height: 300 }}>
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><Loader className="animate-spin h-8 w-8 text-usace-red" /></div>
                    ) : (
                        <ResponsiveContainer>
                            <BarChart data={categoryCounts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                                <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                                <Bar dataKey="count">
                                    {categoryCounts.map((entry, index) => {
                                        let color = '#8884d8';
                                        if(entry.name === 'Outputs') color = COLORS.OUTPUT;
                                        if(entry.name === 'Outtakes') color = COLORS.OUTTAKE;
                                        if(entry.name === 'Outcomes') color = COLORS.OUTCOME;
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card title="Recent Tasks">
                    {loading ? (
                        <div className="flex justify-center items-center h-full py-10"><Loader className="animate-spin h-6 w-6 text-usace-red" /></div>
                    ) : (
                        <ul className="space-y-4">
                            {recentTasks.length > 0 ? recentTasks.map((task) => (
                                <li key={task.id} className="flex items-start space-x-3">
                                    <CheckSquare className="w-5 h-5 mt-1 text-usace-gray" />
                                    <div>
                                        <p className="text-sm text-gray-300">
                                            <span className="font-semibold text-white">{task.title}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">Created on {new Date(task.created_at!).toLocaleDateString()}</p>
                                    </div>
                                </li>
                            )) : <p className="text-center text-gray-400 py-4">No tasks match the current filters.</p>}
                        </ul>
                    )}
                </Card>
                <Card title="Recent Inputs">
                     {loading ? (
                        <div className="flex justify-center items-center h-full py-10"><Loader className="animate-spin h-6 w-6 text-usace-red" /></div>
                    ) : (
                        <ul className="space-y-4">
                            {recentInputs.length > 0 ? recentInputs.map((input) => (
                                <li key={input.id} className="flex items-start space-x-3">
                                    <FileText className="w-5 h-5 mt-1 text-usace-gray" />
                                    <div>
                                        <p className="text-sm text-gray-300">
                                            <span className="font-semibold text-white">{input.profiles?.full_name || 'A user'}</span> logged an {input.category.toLowerCase()}: <span className="text-usace-red">{input.name === 'Other' ? input.custom_name : input.name}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">{new Date(input.created_at).toLocaleDateString()}</p>
                                    </div>
                                </li>
                            )) : <p className="text-center text-gray-400 py-4">No inputs match the current filters.</p>}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DashboardScreen;