import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Megaphone, FileText, CheckSquare, Users, Tv, Bot, Share2, User, Shield } from 'lucide-react';
import Logo from './Logo';
import { useUser } from '../App';
import { UserRole } from '../types';

const icons = {
    dashboard: Home,
    campaigns: Megaphone,
    inputs: FileText,
    tasks: CheckSquare,
    engagements: Users,
    media: Tv,
    'ai-complan': Bot,
    social: Share2,
    profile: User,
    admin: Shield,
};

const Sidebar: React.FC = () => {
    const { user } = useUser();
    // FIX: Add explicit type to navItems to ensure icon property matches 'keyof typeof icons'.
    const navItems: { path: string; label: string; icon: keyof typeof icons }[] = [
        { path: '/', label: 'Dashboard', icon: 'dashboard' },
        { path: '/campaigns', label: 'Campaigns', icon: 'campaigns' },
        { path: '/inputs', label: 'Inputs', icon: 'inputs' },
        { path: '/tasks', label: 'Tasks', icon: 'tasks' },
        { path: '/engagements', label: 'Engagements', icon: 'engagements' },
        { path: '/media', label: 'Media', icon: 'media' },
        { path: '/ai-complan', label: 'AI COMPLAN', icon: 'ai-complan' },
        { path: '/social', label: 'Social', icon: 'social' },
        { path: '/profile', label: 'Profile', icon: 'profile' },
    ];

    const NavItem: React.FC<{ path: string; label: string; icon: keyof typeof icons }> = ({ path, label, icon }) => {
        const IconComponent = icons[icon];
        return (
            <NavLink
                to={path}
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                            ? 'bg-usace-red text-white'
                            : 'text-gray-300 hover:bg-usace-card hover:text-white'
                    }`
                }
            >
                <IconComponent className="w-5 h-5 mr-3" />
                {label}
            </NavLink>
        );
    };

    return (
        <div className="w-64 bg-usace-black flex-shrink-0 flex flex-col border-r border-usace-border">
            <div className="flex items-center justify-center h-20 border-b border-usace-border">
                 <Logo className="h-12" />
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <NavItem key={item.path} {...item} />
                ))}
                {user?.role === UserRole.ADMIN && (
                    <div className="pt-4 mt-4 border-t border-usace-border">
                         <NavItem path="/admin" label="Admin" icon="admin" />
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;
