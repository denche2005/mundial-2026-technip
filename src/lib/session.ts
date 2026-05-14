import { cookies } from "next/headers";
import { cache } from "react";
import { createServiceClient } from "./supabase/service";
import { createSupabaseServerClient } from "./supabase/server";
import type { Profile } from "./types";

/**
 * Resolve the current session user.
 *
 * Order of resolution:
 *   1. Supabase Auth session (OAuth, magic link, password via Supabase Auth).
 *      The matching profile row is looked up by `auth_user_id`.
 *   2. Legacy cookie session (`session_user` = profile id) used by the
 *      pre-existing email/password flow. Kept for backwards compatibility.
 *
 * The returned profile is the canonical identity for everything else in the
 * app (predictions, bracket picks, group membership, scoring).
 */
const readSessionUser = cache(async (): Promise<Profile | null> => {
  // 1) Try Supabase Auth first.
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const service = createServiceClient();
      const { data: profile } = await service
        .from("profiles")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      if (profile) return profile as Profile;
    }
  } catch {
    // If env vars are missing or Supabase is unreachable we fall back to the
    // legacy cookie session below. We deliberately do not throw because most
    // pages should still render gracefully.
  }

  // 2) Fallback: legacy cookie session.
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) return null;

  try {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    return (profile as Profile | null) ?? null;
  } catch {
    // Missing service role key, DB down, etc. — prefer a working public shell
    // over a 500 on every page that calls getSessionUser().
    return null;
  }
});

export async function getSessionUser(): Promise<Profile | null> {
  return readSessionUser();
}

/**
 * Strict variant: returns the user or throws. Use inside server actions to
 * avoid leaking the session resolution branches into business logic.
 */
export async function requireSessionUser(): Promise<Profile> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
