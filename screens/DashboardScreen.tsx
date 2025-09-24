
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from '../components/Card';
import { MOCK_GOALS, MOCK_KPI_TREND_DATA } from '../data/mockData';
import type { Goal } from '../types';
import { Circle, FileText } from 'lucide-react';

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const progressColor = goal.progress_pct > 80 ? 'text-green-400' : goal.progress_pct > 50 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-gray-200">{goal.description}</p>
                <p className="text-xs text-gray-400">Target: {goal.target.toLocaleString()}</p>
            </div>
            <div className="text-right">
                <p className={`text-lg font-bold ${progressColor}`}>{goal.progress_pct}%</p>
                <p className="text-xs text-gray-400">Current: {goal.current.toLocaleString()}</p>
            </div>
        </div>
    );
};


const DashboardScreen: React.FC = () => {
    const recentActivity = [
        { user: 'Jane Doe', action: 'logged a new input', item: 'SacBee Article', time: '2h ago' },
        { user: 'John Public', action: 'completed a task', item: 'Finalize Presentation', time: '8h ago' },
        { user: 'Admin', action: 'created a new campaign', item: 'STEM Outreach', time: '1d ago' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Team KPI Overview</h1>

            <Card title="KPI Trend">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={MOCK_KPI_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#CE1126" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#CE1126" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                            <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                            <Area type="monotone" dataKey="Reach" stroke="#CE1126" fillOpacity={1} fill="url(#colorReach)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Goal KPIs">
                    <div className="divide-y divide-usace-border">
                        {MOCK_GOALS.map(goal => <GoalCard key={goal.id} goal={goal} />)}
                    </div>
                </Card>
                <Card title="Recent Activity">
                    <ul className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <li key={index} className="flex items-start space-x-3">
                                <FileText className="w-5 h-5 mt-1 text-usace-gray" />
                                <div>
                                    <p className="text-sm text-gray-300">
                                        <span className="font-semibold text-white">{activity.user}</span> {activity.action}: <span className="text-usace-red">{activity.item}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default DashboardScreen;
