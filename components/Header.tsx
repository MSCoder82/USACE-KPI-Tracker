import React from 'react';
import { useUser } from '../App';
import { Bell, LogOut } from 'lucide-react';

const Header: React.FC = () => {
    const { user, logout } = useUser();

    if (!user) {
        return null; // Should not happen if App component logic is correct
    }

    return (
        <header className="h-20 bg-usace-card flex-shrink-0 flex items-center justify-between px-6 border-b border-usace-border">
            <div>
                 {/* Can be used for page titles later */}
            </div>
            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full text-gray-400 hover:bg-usace-border hover:text-white transition-colors">
                    <Bell className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-3">
                    <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.profile_photo_url}
                        alt="User Avatar"
                    />
                    <div>
                        <p className="font-semibold text-white text-sm">{user.full_name}</p>
                        <p className="text-gray-400 text-xs capitalize">{user.role} - {user.teams?.name || 'No Team'}</p>
                    </div>
                </div>
                 <button 
                    onClick={logout} 
                    className="p-2 rounded-full text-gray-400 hover:bg-usace-border hover:text-white transition-colors"
                    aria-label="Sign Out"
                    title="Sign Out"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;
