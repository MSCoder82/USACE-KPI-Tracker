import React, { useState, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../App';
import { Save, Loader } from 'lucide-react';
import { uploadAvatar, updateUserProfilePhoto, supabase } from '../lib/supabaseClient';

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
    const { user, updateUser } = useUser();
    // This component will only render if user is not null, so we can assert it.
    const currentUser = user!; 

    const [profile, setProfile] = useState({
        full_name: currentUser.full_name,
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(p => ({ ...p, [name]: value }));
    };

    const handleAvatarChangeClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        if (file.size > 1024 * 1024) { // 1MB limit
            setError("File size must be less than 1MB.");
            return;
        }

        setUploading(true);
        setError(null);
        
        try {
            // 1. Upload the file to Supabase Storage
            const filePath = await uploadAvatar(currentUser.id, file);

            // 2. Update the user's profile record with the file path
            await updateUserProfilePhoto(currentUser.id, filePath);

            // 3. Construct the public URL
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            // 4. Update the user context to reflect the change instantly
            updateUser({ profile_photo_url: publicUrl });

        } catch (err: any) {
            setError(err.message || "Failed to upload photo.");
            console.error(err);
        } finally {
            setUploading(false);
            // Clear the file input value
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>

            {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-md">{`Error: ${error}`}</p>}

            <Card>
                <form className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <img src={currentUser.profile_photo_url} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg"
                                className="hidden"
                                disabled={uploading}
                            />
                            <Button 
                                type="button" 
                                variant="secondary"
                                onClick={handleAvatarChangeClick}
                                disabled={uploading}
                                Icon={uploading ? Loader : undefined}
                            >
                                {uploading ? 'Uploading...' : 'Change Photo'}
                            </Button>
                            <p className="text-xs text-gray-400 mt-2">JPG or PNG. 1MB max.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField name="full_name" label="Full Name" value={profile.full_name} onChange={handleInputChange} />
                        <InputField name="email" label="Email" value={currentUser.email} disabled />
                        <InputField name="role" label="Assigned Role" value={currentUser.role} disabled />
                        {/* FIX: Corrected property access for team name from 'team_name' to 'teams.name' to align with the User type. */}
                        <InputField name="team" label="Team" value={currentUser.teams?.name || 'Unassigned'} disabled />
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