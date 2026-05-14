import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Create a Supabase client for legacy session users.
 * Configures the app.session_user context so RPC functions can identify the user
 * without relying on Supabase Auth (which legacy users don't have).
 */
export async function createSupabaseServerClientWithLegacySession(
    sessionUserId?: string
) {
    const cookieStore = await cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error(
            "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY"
        );
    }

    const client = createServerClient(url, anonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // setAll fails inside a pure Server Component render
                }
            },
        },
    });

    // If we have a session user ID, initialize the legacy session context
    // by calling a helper function that sets the app.session_user GUC
    if (sessionUserId) {
        try {
            // Call a simple query that the RPC can use to detect the legacy session
            // The actual context setting happens via the helper function
            await client.rpc("_init_legacy_session", { p_user_id: sessionUserId });
        } catch (error) {
            // If the helper function doesn't exist or fails, it's OK
            // The RPC functions will still work via current_profile_id()
            // which now checks app.session_user as a fallback
        }
    }

    return client;
}
