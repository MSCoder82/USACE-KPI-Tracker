import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { User } from '../types';
import { UserRole } from '../types';

type EnvRecord = Record<string, string | undefined>;

const env = (import.meta.env ?? {}) as EnvRecord;

const resolveConfig = () => {
    const rawUrl = env.VITE_SUPABASE_URL?.trim();
    const rawAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim();
    const rawPublishableKey = env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();

    if (!rawUrl || rawUrl.length === 0 || rawUrl.includes('YOUR_SUPABASE_URL')) {
        return {
            error: 'Supabase URL is not configured. Set VITE_SUPABASE_URL in your environment variables.',
        } as const;
    }

    const supabaseKey = rawAnonKey || rawPublishableKey;
    if (!supabaseKey) {
        return {
            error: 'Supabase key is not configured. Provide VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.',
        } as const;
    }

    try {
        const parsedUrl = new URL(rawUrl);
        return {
            url: parsedUrl.toString(),
            key: supabaseKey,
            hostname: parsedUrl.hostname,
        } as const;
    } catch (error) {
        return {
            error: `Supabase URL is invalid. ${error instanceof Error ? error.message : 'Please provide a valid URL.'}`,
        } as const;
    }
};

const { url: resolvedUrl, key: resolvedKey, hostname: resolvedHostname, error: configError } = resolveConfig();

const createUnconfiguredClientProxy = (message: string): SupabaseClient => {
    const handler: ProxyHandler<object> = {
        get() {
            throw new Error(message);
        },
        apply() {
            throw new Error(message);
        },
    };

    return new Proxy({}, handler) as SupabaseClient;
};

let internalSupabase: SupabaseClient;
let supabaseInitError: string | null = null;

if (resolvedUrl && resolvedKey) {
    try {
        internalSupabase = createClient(resolvedUrl, resolvedKey);
    } catch (error) {
        const message = `Failed to initialise Supabase client. ${error instanceof Error ? error.message : 'Unknown error.'}`;
        supabaseInitError = message;
        internalSupabase = createUnconfiguredClientProxy(message);
    }
} else {
    const message = configError ?? 'Supabase configuration is incomplete.';
    supabaseInitError = message;
    internalSupabase = createUnconfiguredClientProxy(message);
}

export const supabase = internalSupabase;
export const isSupabaseConfigured = supabaseInitError === null;
export const supabaseProjectHostname = resolvedHostname ?? null;
export { supabaseInitError };

const ensureSupabaseConfigured = () => {
    if (!isSupabaseConfigured) {
        throw new Error(supabaseInitError ?? 'Supabase client is not configured.');
    }
};

/**
 * Fetches the public profile for a given user ID.
 * The profile is stored in a separate `profiles` table.
 * @param userId The UUID of the user.
 * @returns A User object or null if not found or on error.
 */
export const getProfile = async (userId: string, userEmail: string): Promise<User | null> => {
    ensureSupabaseConfigured();

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
    ensureSupabaseConfigured();

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
    ensureSupabaseConfigured();

    const { error } = await supabase
        .from('profiles')
        .update({ profile_photo_url: photoPath })
        .eq('id', userId);

    if (error) {
        throw error;
    }
};
