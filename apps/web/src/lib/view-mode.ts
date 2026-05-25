import type { Profile } from "@/lib/auth";
import type { User } from "@supabase/supabase-js";

export type ViewMode = "candidate" | "employer";

export const viewModeStorageKey = "talentmatch-view-mode";

export function getAccountType(user: User | null, profile: Profile | null): ViewMode {
  const raw =
    profile?.account_type ||
    profile?.role ||
    String(user?.user_metadata?.account_type || user?.user_metadata?.role || "candidate");

  return raw === "employer" ? "employer" : "candidate";
}

export function getActiveViewMode(user: User | null, profile: Profile | null): ViewMode {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(viewModeStorageKey);
    if (stored === "candidate" || stored === "employer") return stored;
  }

  return getAccountType(user, profile);
}
