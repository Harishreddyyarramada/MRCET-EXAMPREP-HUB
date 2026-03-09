import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, missingSupabaseEnvVars, supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type AppRole = "admin" | "faculty" | "student";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    metadata: Record<string, string>
  ) => Promise<{ error: Error | null; needsEmailVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const supabaseConfigError = () =>
  new Error(`Supabase is not configured. Missing env vars: ${missingSupabaseEnvVars.join(", ")}`);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const readMetadataValue = (authUser: User, key: string) => {
    const value = authUser.user_metadata?.[key];
    if (typeof value !== "string") return null;
    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
  };

  const fetchProfile = async (authUser: User) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (!data) {
      setProfile(null);
      return;
    }

    const updates: TablesUpdate<"profiles"> = {};
    const metadataFullName = readMetadataValue(authUser, "full_name");
    const metadataRollNumber = readMetadataValue(authUser, "roll_number");
    const metadataBranch = readMetadataValue(authUser, "branch");
    const metadataYear = readMetadataValue(authUser, "year");

    if (!data.full_name.trim() && metadataFullName) updates.full_name = metadataFullName;
    if (!data.roll_number && metadataRollNumber) updates.roll_number = metadataRollNumber;
    if (!data.branch && metadataBranch) updates.branch = metadataBranch;
    if (!data.year && metadataYear) updates.year = metadataYear;
    if (authUser.email && data.email !== authUser.email) updates.email = authUser.email;

    if (Object.keys(updates).length === 0) {
      setProfile(data);
      return;
    }

    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", authUser.id)
      .select("*")
      .single();

    setProfile(updatedProfile ?? { ...data, ...updates });
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles(data?.map((r) => r.role) || []);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user);
            fetchRoles(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
        fetchRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: Record<string, string>) => {
  if (!isSupabaseConfigured) return { error: supabaseConfigError(), needsEmailVerification: false };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return {
    error: error as Error | null,
    needsEmailVerification: !data.session,
  };
};
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: supabaseConfigError() };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, loading, signUp, signIn, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
