import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { waLink } from "@/lib/business";
import { MessageCircle, Phone, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function Team() {
  const { t, lang } = useI18n();

  // Fetch the data from Supabase
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("visible", true) // Only fetch visible members
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <section id="team" className="py-28 lg:py-36 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--gold)]" />
      </section>
    );
  }

  return (
    <section id="team" className="py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center mb-14">
          <div className="text-xs tracking-[0.3em] uppercase text-[color:var(--gold)] mb-4">
            {t("team.eyebrow")}
          </div>
          <h2 className="font-display text-4xl lg:text-5xl">{t("team.title")}</h2>
          <div className="hairline w-32 mx-auto mt-6" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((b, i) => {
            const msg = lang === "sq"
              ? `Përshëndetje ${b.name}! Dua të rezervoj një termin.`
              : `Hello ${b.name}! I'd like to book an appointment.`;
            
            const initials = b.name.split(" ").map((n) => n[0]).join("");
            
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-[color:var(--gold)]/40 transition-all"
              >
                <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-[color:var(--surface-2)] to-background flex items-center justify-center">
                  {/* Shfaq foton nëse ekziston, përndryshe inicialet */}
                  {b.image_url ? (
                    <img 
                      src={b.image_url} 
                      alt={b.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <span className="font-display text-7xl text-gold-gradient opacity-60 group-hover:scale-110 transition-transform duration-700">
                      {initials}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.78_0.13_80_/_0.15),transparent_60%)]" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-foreground">{b.name}</h3>
                  <div className="text-xs tracking-widest uppercase text-[color:var(--gold)] mt-1">
                    {b.role}
                  </div>
                  <div className="mt-5 flex gap-2">
                    <a
                      href={waLink(b.whatsapp || "", msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-gold rounded-full px-3 py-2 text-xs inline-flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> {t("team.book")}
                    </a>
                    <a
                      href={`tel:${b.phone || ""}`}
                      className="rounded-full p-2 border border-border hover:border-[color:var(--gold)]/50 hover:text-[color:var(--gold)] text-muted-foreground transition"
                      aria-label={`Call ${b.name}`}
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}