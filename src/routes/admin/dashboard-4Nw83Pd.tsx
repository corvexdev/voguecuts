import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Admin from "@/components/admin/Admin";

export const Route = createFileRoute("/admin/dashboard-4Nw83Pd")({
  component: AdminDashboardComponent,
});

function AdminDashboardComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkStaticAuth = async () => {
      // 1. Kontrollojmë nëse shfletuesi ka sesion të ruajtur
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (data?.is_admin) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }

      // 2. Kontrollojmë nëse po vjen token-i sekret i Supabase (përmes Magic Link)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", currentSession.user.id)
            .single();

          if (data?.is_admin) {
            setIsAuthorized(true);
          } else {
            await supabase.auth.signOut();
          }
        }
        setIsLoading(false);
      });

      // Timer sigurie për të fikur loading-un nëse nuk ka sesion valid
      const timer = setTimeout(() => setIsLoading(false), 1200);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
      };
    };

    checkStaticAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Nëse je admin i konfirmuar, të hapet dashboard-i. Përndryshe, mbetet si faqe false 404.
  return isAuthorized ? (
    <Admin />
  ) : (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 text-sm font-mono">
      404 Not Found
    </div>
  );
}