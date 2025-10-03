import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';
import { UserRole } from '../types';

// =================================================================================
// The client now reads from environment variables.
// In your project settings, you MUST add your Supabase credentials.
//
// SUPABASE_URL="YOUR_SUPABASE_URL"
// SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
// =================================================================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '10px';
    errorDiv.style.padding = '10px';
    errorDiv.style.background = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.zIndex = '1000';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.innerHTML = '<b>CRITICAL ERROR:</b> Supabase client is not configured. Please ensure <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> are set in your environment variables.';
    document.body.prepend(errorDiv);
    
    // Throw an error to stop execution
    throw new Error("Supabase credentials are not configured in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches the public profile for a given user ID.
 * The profile is stored in a separate `profiles` table.
 * @param userId The UUID of the user.
 * @returns A User object or null if not found or on error.
 */
export const getProfile = async (userId: string, userEmail: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*, teams(id, name)')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error.message);
        // This could happen if a profile hasn't been created yet for a new user.
        // We can create a default one here or handle it gracefully.
        return null;
    }

    if (data) {
        // Construct the full URL for the profile photo
        let photoUrl = `https://picsum.photos/seed/${data.id}/200`; // default placeholder
        if (data.profile_photo_url) {
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.profile_photo_url);
            photoUrl = publicUrl;
        }

        return {
            id: data.id,
            email: userEmail,
            full_name: data.full_name,
            role: data.role as UserRole,
            team_id: data.team_id,
            teams: data.teams as { id: string, name: string } | null,
            profile_photo_url: photoUrl,
        };
    }

    return null;
};

/**
 * Uploads a new avatar image to the 'avatars' storage bucket.
 * @param userId The ID of the user uploading the file.
 * @param file The file object to upload.
 * @returns The path of the uploaded file.
 */
export const uploadAvatar = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    return filePath;
};

/**
 * Updates the user's profile with the new photo URL.
 * @param userId The ID of the user.
 * @param photoPath The path of the photo in the storage bucket.
 */
export const updateUserProfilePhoto = async (userId: string, photoPath: string) => {
    const { error } = await supabase
        .from('profiles')
        .update({ profile_photo_url: photoPath })
        .eq('id', userId);

    if (error) {
        throw error;
    }
};
