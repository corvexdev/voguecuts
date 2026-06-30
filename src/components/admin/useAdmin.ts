import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface AdminUser {
  email?: string;
  name?: string;
  avatar?: string;
}

export function useAdminStatus() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let canceled = false;

    const loadAdminState = async (session: Session | null) => {
      if (!session?.user) {
        if (!canceled) {
          setIsAdmin(false);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (canceled) return;

      const admin = !!data?.is_admin && !error;
      setIsAdmin(admin);

      if (admin) {
        setUser({
          email: session.user.email ?? undefined,
          name:
            session.user.user_metadata?.full_name ??
            session.user.email?.split("@")[0] ??
            "Admin",
          avatar:
            session.user.user_metadata?.avatar_url ??
            session.user.email?.[0]?.toUpperCase(),
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await loadAdminState(session);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      loadAdminState(session);
    });

    return () => {
      canceled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, user, loading };
}
