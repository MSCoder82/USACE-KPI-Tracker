import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';
import { UserRole } from '../types';

// =================================================================================
// The client now reads from the .env.local file.
// You MUST create a .env.local file in the root of your project
// and add your Supabase credentials there.
//
// REACT_APP_SUPABASE_URL="YOUR_SUPABASE_URL"
// REACT_APP_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
// =================================================================================
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;


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
    errorDiv.innerHTML = '<b>CRITICAL ERROR:</b> Supabase client is not configured. Please open the <code>.env.local</code> file in your project and add your Supabase URL and Anon Key.';
    document.body.prepend(errorDiv);
    
    // Throw an error to stop execution
    throw new Error("Supabase credentials are not configured in .env.local file.");
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
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error.message);
        // This could happen if a profile hasn't been created yet for a new user.
        // We can create a default one here or handle it gracefully.
        return null;
    }

    if (data) {
        return {
            id: data.id,
            email: userEmail,
            full_name: data.full_name,
            role: data.role as UserRole,
            team_id: data.team_id,
            team_name: data.team_name,
            profile_photo_url: data.profile_photo_url || `https://picsum.photos/seed/${data.id}/200`,
        };
    }

    return null;
};
