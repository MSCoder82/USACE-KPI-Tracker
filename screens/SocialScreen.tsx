
import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Share2, Link } from 'lucide-react';

const SocialScreen: React.FC = () => {
    const connections = [
        { provider: 'Sprinklr', platform: 'Facebook', status: 'Connected' },
        { provider: 'Native', platform: 'X (Twitter)', status: 'Connected' },
        { provider: 'Native', platform: 'Instagram', status: 'Disconnected' },
    ];

    const recentPosts = [
        { timestamp: '2024-07-22 10:05 AM', channel: 'Facebook', text: 'Great turnout at the Folsom Dam public meeting last night! Thanks to everyone who participated.', engagements: 125, link: '#' },
        { timestamp: '2024-07-21 02:30 PM', channel: 'X (Twitter)', text: 'REMINDER: Water levels are high. Always wear a life jacket when on or near the water. #WaterSafety', engagements: 450, link: '#' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Social Connections & Posts</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card title="Connections">
                    <div className="space-y-2 mb-4">
                        {connections.map((conn, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-usace-border rounded-md">
                                <div>
                                    <span className="font-semibold text-white">{conn.platform}</span>
                                    <span className="text-xs text-gray-400 ml-2">({conn.provider})</span>
                                </div>
                                <span className={`text-xs font-bold ${conn.status === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>{conn.status}</span>
                            </div>
                        ))}
                    </div>
                     <div className="flex space-x-2">
                         <Button Icon={Share2} variant="secondary" className="flex-1">Connect Sprinklr</Button>
                         <Button Icon={Link} className="flex-1">Connect Platform</Button>
                     </div>
                 </Card>

                 <Card title="Recent Posts">
                     <div className="space-y-4">
                         {recentPosts.map((post, i) => (
                             <div key={i} className="p-3 bg-usace-border rounded-md">
                                 <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-usace-red">{post.channel}</span>
                                    <span className="text-xs text-gray-400">{post.timestamp}</span>
                                 </div>
                                 <p className="text-sm text-gray-300 mb-2">{post.text}</p>
                                 <div className="flex justify-between text-xs">
                                     <span className="text-gray-400">Engagements: <span className="font-semibold text-white">{post.engagements}</span></span>
                                     <a href={post.link} className="text-blue-400 hover:underline">View Post</a>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </Card>
            </div>
        </div>
    );
};

export default SocialScreen;
