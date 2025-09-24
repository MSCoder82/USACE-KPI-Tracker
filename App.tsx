
import React, { useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types';
import { UserRole } from './types';
import { MOCK_USER } from './data/mockData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardScreen from './screens/DashboardScreen';
import CampaignsScreen from './screens/CampaignsScreen';
import InputsScreen from './screens/InputsScreen';
import TasksScreen from './screens/TasksScreen';
import EngagementsScreen from './screens/EngagementsScreen';
import MediaScreen from './screens/MediaScreen';
import AIComplanScreen from './screens/AIComplanScreen';
import SocialScreen from './screens/SocialScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';

interface UserContextType {
    user: User;
    logout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    const { user, logout } = context;
    const hasPermission = (roles: UserRole[]) => roles.includes(user.role);
    return { user, hasPermission, logout };
};

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    const handleLogin = () => {
        // In a real app, this would involve an API call and setting user data.
        // For this simulation, we'll just use the mock user.
        setUser(MOCK_USER);
    };

    const handleLogout = () => {
        setUser(null);
    };
    
    if (!user) {
        return <AuthScreen onLogin={handleLogin} />;
    }

    return (
        <UserContext.Provider value={{ user, logout: handleLogout }}>
            <div className="flex h-screen bg-usace-bg text-gray-200">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-usace-bg p-6">
                        <Routes>
                            <Route path="/" element={<DashboardScreen />} />
                            <Route path="/campaigns" element={<CampaignsScreen />} />
                            <Route path="/inputs" element={<InputsScreen />} />
                            <Route path="/tasks" element={<TasksScreen />} />
                            <Route path="/engagements" element={<EngagementsScreen />} />
                            <Route path="/media" element={<MediaScreen />} />
                            <Route path="/ai-complan" element={<AIComplanScreen />} />
                            <Route path="/social" element={<SocialScreen />} />
                            <Route path="/profile" element={<ProfileScreen />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </UserContext.Provider>
    );
};

export default App;
