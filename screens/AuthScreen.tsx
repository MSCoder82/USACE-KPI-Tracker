import React, { useState } from 'react';
import Button from '../components/Button';
import { LogIn } from 'lucide-react';
import Logo from '../components/Logo';

interface AuthScreenProps {
    onLogin: () => void;
}

const AuthInput: React.FC<{id: string, type: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({id, type, placeholder, value, onChange}) => (
    <input
        id={id}
        name={id}
        type={type}
        required
        className="w-full px-3 py-2 bg-usace-border border border-usace-border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-usace-red"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
    />
);

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically call an authentication API.
        // For this demo, we'll just call the onLogin callback to simulate success.
        onLogin();
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
                    <div className="flex border-b border-usace-border mb-6">
                        <button onClick={() => setIsSignIn(true)} className={`w-1/2 py-3 text-sm font-medium ${isSignIn ? 'text-usace-red border-b-2 border-usace-red' : 'text-gray-400'}`}>
                            Sign In
                        </button>
                        <button onClick={() => setIsSignIn(false)} className={`w-1/2 py-3 text-sm font-medium ${!isSignIn ? 'text-usace-red border-b-2 border-usace-red' : 'text-gray-400'}`}>
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isSignIn && (
                           <AuthInput id="fullName" type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        )}
                        <AuthInput id="email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <AuthInput id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        
                        {isSignIn && (
                            <div className="flex items-center justify-between">
                                <a href="#" className="text-sm text-usace-red hover:underline">Forgot password?</a>
                            </div>
                        )}

                        <Button type="submit" className="w-full" Icon={LogIn}>
                            {isSignIn ? 'Sign In' : 'Create Account'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
