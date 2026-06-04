import { supabase } from "@/utils/supabase";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Profile = {
  id: string;
  full_name?: string | null;
  contact_information?: string | null;
  education?: string | null;
  major_field_of_study?: string | null;
  years_of_experience?: number | string | null;
  work_experience?: string | null;
  skills?: string | null;
  preferred_working_mode?: string | null;
  preferred_location?: string | null;
  resume_name?: string | null;
  resume_data?: string | null;
  company_name?: string | null;
  company_website?: string | null;
  company_description?: string | null;
  company_location?: string | null;
  membership_tier?: string | null;
  membership_updated_at?: string | null;
  job_alert_query?: string | null;
  job_alert_category?: string | null;
  job_alert_mode?: string | null;
  job_alert_experience?: string | null;
  role?: string | null;
  account_type?: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function timeout<T>(value: T, milliseconds = 2500) {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), milliseconds);
  });
}

async function getProfile(userId: string) {
  const result = await Promise.race([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    timeout({ data: null, error: new Error("Profile request timed out") }),
  ]);

  const { data, error } = result;

  if (error) {
    console.warn("Could not load profile:", error.message);
    return null;
  }

  return data as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user.id;
    setProfile(userId ? await getProfile(userId) : null);
  }, [session?.user.id]);

  useEffect(() => {
    let active = true;

    Promise.race([
      supabase.auth.getSession(),
      timeout({ data: { session: null }, error: new Error("Session request timed out") }),
    ])
      .then(async ({ data }) => {
        if (!active) return;
        setSession(data.session);
        setProfile(data.session ? await getProfile(data.session.user.id) : null);
      })
      .catch((error) => {
        console.warn("Could not load auth session:", error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession);
        setProfile(nextSession ? await getProfile(nextSession.user.id) : null);
        setLoading(false);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, profile, refreshProfile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
