import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { PRIMARY_WHATSAPP, waLink } from "@/lib/business";
import { Clock, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function Services() {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false); // Këtu mund të bësh check auth.user()

  // 1. Tërheqja e shërbimeve
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // 2. Fshirja e shërbimit (Logjikë për admin)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-yellow-500" /></div>;

  return (
    <section id="services" className="relative py-28 lg:py-36 bg-[color:var(--surface)]/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl lg:text-5xl">{t("services.title")}</h2>
          <div className="hairline w-32 mx-auto mt-6" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services?.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="group relative rounded-2xl p-7 bg-card border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display text-xl">{lang === "sq" ? s.sq_name : s.en_name}</h3>
                <div className="text-xl text-gold font-bold">{s.price}€</div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">{lang === "sq" ? s.sq_desc : s.en_desc}</p>
              
              <div className="flex items-center justify-between pt-5 border-t border-border">
                <span className="text-xs flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {s.duration}</span>
                
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button onClick={() => deleteMutation.mutate(s.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <a href={waLink(PRIMARY_WHATSAPP, `Dua të rezervoj: ${s.sq_name}`)} target="_blank" className="text-sm text-gold">
                    {t("services.book")} <ArrowRight className="h-3.5 w-3.5 inline" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}