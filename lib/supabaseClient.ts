import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';
import { UserRole } from '../types';

// =================================================================================
// The client now reads from the .env.local file (Vite environment).
// You MUST create a .env.local file in the root of your project
// and add your Supabase credentials there using the Vite `VITE_` prefix.
//
// VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
// VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
// or the newer naming:
// VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY="YOUR_SUPABASE_ANON_KEY"
// =================================================================================
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabasePublishableKey = import.meta.env
    .VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string | undefined;
const supabasePublicKey = supabaseAnonKey ?? supabasePublishableKey;

let supabaseInitializationError: string | null = null;
let supabaseClient: ReturnType<typeof createClient> | null = null;
let supabaseUrl: string | null = null;
let supabaseHostname: string | null = null;

if (typeof rawSupabaseUrl === 'string') {
    const candidateUrl = rawSupabaseUrl.trim();
    if (candidateUrl && candidateUrl !== 'YOUR_SUPABASE_URL') {
        try {
            const parsedUrl = new URL(candidateUrl);
            parsedUrl.hash = '';
            const cleanedPathname = parsedUrl.pathname.replace(/\/+$/, '');
            supabaseUrl = `${parsedUrl.origin}${cleanedPathname}`;
            supabaseHostname = parsedUrl.hostname;
        } catch (error) {
            supabaseInitializationError =
                'Invalid Supabase URL. Please ensure VITE_SUPABASE_URL is a fully-qualified URL such as https://your-project.supabase.co';
            console.error('Failed to parse Supabase URL:', error);
        }
    }
}

const hasSupabaseCredentials = Boolean(
    supabaseUrl &&
    supabasePublicKey &&
    !supabaseInitializationError
);

if (hasSupabaseCredentials) {
    try {
        supabaseClient = createClient(supabaseUrl!, supabasePublicKey!);
    } catch (error) {
        supabaseInitializationError = error instanceof Error ? error.message : String(error);
        console.error('Failed to initialize Supabase client:', supabaseInitializationError);
    }
} else if (!supabaseInitializationError) {
    console.error(
        'Supabase client is not configured. Please create a .env.local file and add VITE_SUPABASE_URL along with either VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.'
    );
}

export const isSupabaseConfigured = Boolean(supabaseClient);
export const supabaseInitError = supabaseInitializationError;
export const supabaseProjectUrl = supabaseUrl;
export const supabaseProjectHostname = supabaseHostname;

const createUnconfiguredClient = () =>
    new Proxy({}, {
        get(_target, property) {
            throw new Error(
                `Supabase client is not configured. Attempted to access "${String(property)}".`
            );
        }
    }) as ReturnType<typeof createClient>;

export const supabase = supabaseClient ?? createUnconfiguredClient();

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
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error.message);
        // This could happen if a profile hasn't been created yet for a new user.
        // We can create a default one here or handle it gracefully.
        return null;
    }

    if (!data) {
        return null;
    }

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
