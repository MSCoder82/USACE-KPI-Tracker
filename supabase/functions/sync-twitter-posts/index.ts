
// FIX: Import `serve` from the Deno standard library for compatibility.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Note: This is a Deno environment.
// For full functionality, you would need to implement OAuth token exchange
// and secure storage/retrieval of tokens. This is a simplified example.

// WARNING: This is a simplified example. In a real production app, you would
// need a robust system to securely retrieve the user's OAuth access token.
// Supabase provides ways to handle this, but it's beyond a simple function.
// This example assumes a valid provider_token exists for demonstration.

async function getProviderToken(supabase: any, userId: string) {
    // This is a placeholder. In a real app, you would securely fetch the user's
    // encrypted OAuth token that was stored during the sign-in flow.
    // For this example, we'll try to get it from the session, which might work
    // for a short period after login.
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        throw new Error("Could not retrieve user session to get provider token.");
    }
    return session.provider_token;
}

// FIX: Use the imported `serve` function instead of Deno.serve to fix type errors.
serve(async (req) => {
    try {
        const { connection_id } = await req.json();

        if (!connection_id) {
            throw new Error("Connection ID is required.");
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const providerToken = await getProviderToken(supabase, user.id);
        if (!providerToken) throw new Error("Provider token not available.");

        // Fetch user's Twitter ID using their token
        const meResponse = await fetch('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${providerToken}`
            }
        });
        const meData = await meResponse.json();
        const twitterUserId = meData.data.id;

        // Fetch recent tweets
        const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${twitterUserId}/tweets?tweet.fields=public_metrics,created_at&expansions=author_id`, {
             headers: {
                'Authorization': `Bearer ${providerToken}`
            }
        });
        const tweetsData = await tweetsResponse.json();
        
        if (!tweetsData.data) {
             return new Response(JSON.stringify({ message: "No new tweets found or API error." }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            });
        }
        
        const { data: connection } = await supabase.from('social_connections').select('team_id').eq('id', connection_id).single();
        if(!connection) throw new Error("Connection not found");
        
        const postsToInsert = tweetsData.data.map((tweet: any) => ({
            connection_id,
            team_id: connection.team_id,
            platform: 'twitter',
            post_id: tweet.id,
            post_text: tweet.text,
            post_url: `https://twitter.com/${meData.data.username}/status/${tweet.id}`,
            author_name: meData.data.name,
            author_handle: meData.data.username,
            author_avatar_url: meData.data.profile_image_url, // You might need to fetch user details to get this
            metrics: {
                likes: tweet.public_metrics.like_count,
                retweets: tweet.public_metrics.retweet_count,
                replies: tweet.public_metrics.reply_count,
                views: tweet.public_metrics.impression_count,
            },
            posted_at: tweet.created_at,
        }));

        if (postsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('social_posts')
                .upsert(postsToInsert, { onConflict: 'connection_id, post_id' });
            
            if (insertError) throw insertError;
        }

        return new Response(JSON.stringify({ message: `Synced ${postsToInsert.length} posts.` }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
