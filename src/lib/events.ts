import { createServiceClient } from "./supabase/service";

/**
 * Lightweight server-side event log. Use this from server actions when
 * something unexpected happens (failed invite redemption, save error,
 * race condition recovery...) so we have a real trail instead of just
 * console.log noise.
 *
 * Failures inside the logger itself are swallowed — observability must
 * never break the user-facing operation it is observing.
 */
export async function logEvent(
  kind: string,
  payload?: Record<string, unknown>,
  userId?: string | null
): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from("app_events").insert({
      kind,
      user_id: userId ?? null,
      payload: payload ?? null,
    });
  } catch {
    // Intentionally silent — see comment above.
  }
}
