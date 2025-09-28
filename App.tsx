import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types';
import { UserRole } from './types';
import { supabase, getProfile, isSupabaseConfigured } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

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
import AdminScreen from './screens/AdminScreen'; // Import the new Admin Screen
import { Loader } from 'lucide-react';

interface UserContextType {
    user: User | null;
    logout: () => void;
    updateUser: (updatedFields: Partial<User>) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    const { user, logout, updateUser } = context;
    const hasPermission = (roles: UserRole[]) => user ? roles.includes(user.role) : false;
    return { user, hasPermission, logout, updateUser };
};

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }

        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                const profile = await getProfile(session.user.id, session.user.email!);
                setUser(profile);
            }
            setLoading(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session) {
                const profile = await getProfile(session.user.id, session.user.email!);
                setUser(profile);
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        if (!isSupabaseConfigured) {
            return;
        }
        await supabase.auth.signOut();
    };

    const handleUpdateUser = (updatedFields: Partial<User>) => {
        setUser(prevUser => prevUser ? { ...prevUser, ...updatedFields } : null);
    };
    
    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-usace-bg">
                <Loader className="h-8 w-8 animate-spin text-usace-red" />
            </div>
        );
    }

    if (!session || !user) {
        return (
            <AuthScreen
                disabled={!isSupabaseConfigured}
                notice={!isSupabaseConfigured ? (
                    <>
                        <p className="font-semibold">Supabase configuration missing</p>
                        <p className="mt-1 text-xs text-gray-300">
                            Create a <code>.env.local</code> file in the project root with <code>VITE_SUPABASE_URL</code> and
                            <code>VITE_SUPABASE_ANON_KEY</code> to enable authentication.
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                            After saving the file, restart the development server and reload this page.
                        </p>
                    </>
                ) : undefined}
            />
        );
    }

    return (
        <UserContext.Provider value={{ user, logout: handleLogout, updateUser: handleUpdateUser }}>
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
                            <Route 
                                path="/admin" 
                                element={
                                    user.role === UserRole.ADMIN ? <AdminScreen /> : <Navigate to="/" />
                                } 
                            />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </UserContext.Provider>
    );
};

export default App;
