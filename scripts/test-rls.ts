/**
 * Basic RLS smoke tests (read-only + one denied write) for manual execution.
 *
 * Required env vars:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - RLS_TEST_EMAIL
 * - RLS_TEST_PASSWORD
 * - RLS_TEST_OTHER_PROFILE_ID   (profile UUID from a different user)
 */

import { createClient } from "@supabase/supabase-js";

function need(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

async function main() {
  const url = need("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = need("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const email = need("RLS_TEST_EMAIL");
  const password = need("RLS_TEST_PASSWORD");
  const otherProfileId = need("RLS_TEST_OTHER_PROFILE_ID");

  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) Anon cannot read app_events.
  const anonAppEvents = await anon.from("app_events").select("id", { head: true, count: "exact" });
  if (!anonAppEvents.error) {
    throw new Error("FAIL: anon unexpectedly read app_events");
  }
  console.log("OK: anon denied on app_events");

  // 2) Login as authenticated user (anon key + auth session).
  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signIn = await authClient.auth.signInWithPassword({ email, password });
  if (signIn.error) throw new Error(`Sign-in failed: ${signIn.error.message}`);
  console.log("OK: authenticated test session created");

  // 3) Authenticated cannot read another user's predictions.
  // Under RLS this should return 0 rows (filtered out), not foreign rows.
  const otherPredictions = await authClient
    .from("match_predictions")
    .select("id,user_id")
    .eq("user_id", otherProfileId)
    .limit(1);
  if (otherPredictions.error) throw new Error(`Unexpected query error: ${otherPredictions.error.message}`);
  if ((otherPredictions.data ?? []).length > 0) {
    throw new Error("FAIL: authenticated user can read someone else's match_predictions");
  }
  console.log("OK: authenticated cannot read other user's match_predictions");

  // 4) Authenticated cannot insert app_events.
  const deniedInsert = await authClient.from("app_events").insert({
    kind: "rls_test_attempt",
    payload: { source: "scripts/test-rls.ts" },
  });
  if (!deniedInsert.error) {
    throw new Error("FAIL: authenticated user unexpectedly inserted app_events");
  }
  console.log("OK: authenticated denied insert on app_events");

  console.log("All RLS smoke tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
