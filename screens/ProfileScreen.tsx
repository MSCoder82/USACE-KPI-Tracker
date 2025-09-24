import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { Save } from 'lucide-react';

const InputField: React.FC<{
    name: string;
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    disabled?: boolean;
}> = ({name, label, value, onChange, type="text", disabled = false}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-usace-border rounded-md p-2 text-sm text-gray-200 focus:ring-usace-red focus:border-usace-red disabled:opacity-50 disabled:cursor-not-allowed"
        />
    </div>
);

const ProfileScreen: React.FC = () => {
    const { user } = useUser();
    // This component will only render if user is not null, so we can assert it.
    const currentUser = user!; 

    const [profile, setProfile] = useState({
        full_name: currentUser.full_name,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(p => ({ ...p, [name]: value }));
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <Card>
                <form className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <img src={currentUser.profile_photo_url} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                        <div>
                            <Button type="button" variant="secondary">Change Photo</Button>
                            <p className="text-xs text-gray-400 mt-2">JPG or PNG. 1MB max.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField name="full_name" label="Full Name" value={profile.full_name} onChange={handleInputChange} />
                        <InputField name="email" label="Email" value={currentUser.email} disabled />
                        <InputField name="role" label="Assigned Role" value={currentUser.role} disabled />
                        <InputField name="team_name" label="Team" value={currentUser.team_name} disabled />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button Icon={Save}>Save Changes</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ProfileScreen;