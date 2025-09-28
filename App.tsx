import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types';
import { UserRole } from './types';
import { supabase, getProfile, isSupabaseConfigured, supabaseInitError } from './lib/supabaseClient';
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
import AuthScreen, { type AuthNotice } from './screens/AuthScreen';
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
    const [authError, setAuthError] = useState<string | null>(null);
    const [forceAuthPreview, setForceAuthPreview] = useState(false);

    useEffect(() => {
        const resolveAuthPreviewFlag = () => {
            try {
                const url = new URL(window.location.href);
                if (url.searchParams.has('auth-preview')) {
                    return true;
                }

                if (url.hash.includes('?')) {
                    const [, hashQuery] = url.hash.split('?');
                    if (hashQuery) {
                        const hashParams = new URLSearchParams(hashQuery);
                        if (hashParams.has('auth-preview')) {
                            return true;
                        }
                    }
                }
            } catch (error) {
                console.error('Unable to parse URL for auth preview flag:', error);
            }

            return false;
        };

        const updateAuthPreview = () => {
            setForceAuthPreview(resolveAuthPreviewFlag());
        };

        updateAuthPreview();
        window.addEventListener('hashchange', updateAuthPreview);
        window.addEventListener('popstate', updateAuthPreview);

        return () => {
            window.removeEventListener('hashchange', updateAuthPreview);
            window.removeEventListener('popstate', updateAuthPreview);
        };
    }, []);

    useEffect(() => {
        if (forceAuthPreview) {
            setSession(null);
            setUser(null);
            setAuthError(null);
            setLoading(false);
            return;
        }

        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }

        const fetchSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Error fetching session:', error.message);
                    setAuthError('We could not connect to the authentication service. Please refresh the page or try again later.');
                } else {
                    setAuthError(null);
                }

                setSession(session);

                if (session) {
                    try {
                        const profile = await getProfile(session.user.id, session.user.email!);
                        setUser(profile);
                    } catch (profileError) {
                        console.error('Error loading profile:', profileError);
                        setUser(null);
                        setAuthError('We were unable to load your profile. Please try again.');
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Unexpected error fetching session:', error);
                setSession(null);
                setUser(null);
                setAuthError('We could not connect to the authentication service. Please refresh the page or try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session) {
                try {
                    const profile = await getProfile(session.user.id, session.user.email!);
                    setUser(profile);
                    setAuthError(null);
                } catch (profileError) {
                    console.error('Error loading profile after auth state change:', profileError);
                    setUser(null);
                    setAuthError('We were unable to load your profile. Please try again.');
                }
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [forceAuthPreview]);

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

    const shouldShowAuthScreen = !session || !user || forceAuthPreview;
    if (shouldShowAuthScreen) {
        const notices: AuthNotice[] = [];

        if (!isSupabaseConfigured) {
            if (supabaseInitError) {
                notices.push({
                    type: 'error',
                    message: (
                        <>
                            <p className="font-semibold">Authentication configuration error</p>
                            <p className="mt-1 text-xs text-gray-300">{supabaseInitError}</p>
                        </>
                    ),
                });
            }

            notices.push({
                type: 'warning',
                message: (
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
                ),
            });
        }

        if (forceAuthPreview) {
            notices.unshift({
                type: 'info',
                message: (
                    <>
                        <p className="font-semibold">Authentication preview mode</p>
                        <p className="mt-1 text-xs text-gray-300">
                            You can explore the sign-in and registration screens without connecting to Supabase. Form submissions
                            are blocked until Supabase credentials are configured.
                        </p>
                    </>
                ),
            });
        }

        if (authError && isSupabaseConfigured) {
            notices.push({
                type: 'error',
                message: authError,
            });
        }

        return (
            <AuthScreen
                disabled={!isSupabaseConfigured && !forceAuthPreview}
                notices={notices}
                supabaseConnected={isSupabaseConfigured && !supabaseInitError}
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
