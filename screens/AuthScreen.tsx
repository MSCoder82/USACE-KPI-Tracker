import React, { useState } from 'react';
import Button from '../components/Button';
import { LogIn, Loader } from 'lucide-react';
import Logo from '../components/Logo';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthInputProps {
    id: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({ id, type, placeholder, value, onChange, disabled = false }) => (
    <input
        id={id}
        name={id}
        type={type}
        required
        className="w-full px-3 py-2 bg-usace-border border border-usace-border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-usace-red disabled:opacity-60"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
    />
);

export type AuthNoticeVariant = 'info' | 'warning' | 'error';

export interface AuthNotice {
    type: AuthNoticeVariant;
    message: React.ReactNode;
}

interface AuthScreenProps {
    disabled?: boolean;
    notices?: AuthNotice[];
}

const noticeStyles: Record<AuthNoticeVariant, string> = {
    info: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
    warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    error: 'border-red-500/40 bg-red-500/10 text-red-300',
};

const AuthScreen: React.FC<AuthScreenProps> = ({ disabled = false, notices }) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (disabled || !isSupabaseConfigured) {
            setError('Authentication is currently unavailable. Please configure Supabase to enable sign in and sign up.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        if (isSignIn) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        // You can add default role or team here if needed
                        // role: 'staff', 
                        // team_name: 'Default Team',
                    }
                }
            });
            if (error) {
                setError(error.message);
            } else if (data.user?.identities?.length === 0) {
                 setError("This user already exists. Please try signing in.");
            } else {
                setMessage("Success! Please check your email for a verification link.");
            }
        }
        setLoading(false);
    };
    
    return (
        <div className="min-h-screen bg-usace-bg flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                     <Logo className="h-20" />
                </div>
                <h1 className="text-2xl font-bold text-center text-white mb-2">USACE PAO KPI Tracker</h1>
                <p className="text-center text-gray-400 mb-8">Please sign in to continue</p>

                <div className="bg-usace-card p-8 rounded-lg shadow-lg border border-usace-border">
                    {notices && notices.length > 0 && (
                        <div className="mb-4 space-y-3">
                            {notices.map((notice, index) => (
                                <div
                                    key={index}
                                    className={`rounded border p-3 text-sm ${noticeStyles[notice.type]}`}
                                >
                                    {notice.message}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex border-b border-usace-border mb-6">
                        <button onClick={() => { setIsSignIn(true); setError(null); setMessage(null); }} className={`w-1/2 py-3 text-sm font-medium ${isSignIn ? 'text-usace-red border-b-2 border-usace-red' : 'text-gray-400'}`}>
                            Sign In
                        </button>
                        <button onClick={() => { setIsSignIn(false); setError(null); setMessage(null); }} className={`w-1/2 py-3 text-sm font-medium ${!isSignIn ? 'text-usace-red border-b-2 border-usace-red' : 'text-gray-400'}`}>
                            Sign Up
                        </button>
                    </div>

                    {error && <p className="mb-4 text-center text-sm text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
                    {message && <p className="mb-4 text-center text-sm text-green-400 bg-green-500/10 p-2 rounded">{message}</p>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isSignIn && (
                           <AuthInput id="fullName" type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={disabled} />
                        )}
                        <AuthInput id="email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={disabled} />
                        <AuthInput id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={disabled} />

                        {isSignIn && (
                            <div className="flex items-center justify-between">
                                <a href="#" className={`text-sm ${disabled ? 'text-gray-500' : 'text-usace-red hover:underline'}`}>Forgot password?</a>
                            </div>
                        )}

                        <Button type="submit" className="w-full" Icon={loading ? Loader : LogIn} disabled={loading || disabled}>
                            {loading ? (isSignIn ? 'Signing In...' : 'Creating Account...') : (isSignIn ? 'Sign In' : 'Create Account')}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;