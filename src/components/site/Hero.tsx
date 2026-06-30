import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query"; // Shtuar
import { supabase } from "@/lib/supabase";       // Shtuar
import { PRIMARY_WHATSAPP, waLink } from "@/lib/business";
import { Calendar, MessageCircle, MapPin } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export function Hero() {
  const { t, lang } = useI18n();

  // Logjika për të marrë të dhënat nga Supabase bazuar në gjuhë
  const { data: hero } = useQuery({
    queryKey: ["hero_section", lang],
    queryFn: async () => {
      const { data } = await supabase
        .from("hero_section")
        .select("*")
        .eq("lang", lang)
        .maybeSingle();
      return data;
    },
  });

  const msg = lang === "sq"
    ? "Përshëndetje! Dua të rezervoj një termin në Vogue Cutts."
    : "Hello! I'd like to book an appointment at Vogue Cutts.";

  return (
    <section id="home" className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background image (replace with video later) */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Vogue Cutts barbershop interior"
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(0.12_0.005_60)_85%)]" />
      </div>

      {/* Decorative gold frame corners */}
      <div className="pointer-events-none absolute inset-6 lg:inset-10 border border-[color:var(--gold)]/15" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 pt-28 pb-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[color:var(--gold)] mb-6">
            <MapPin className="h-3.5 w-3.5" />
            {t("hero.eyebrow")}
          </div>
          
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-foreground">
            {hero?.headline ? (
              <>
                {hero.headline.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-gold-gradient italic">
                  {hero.headline.split(" ").slice(-2).join(" ")}
                </span>
              </>
            ) : (
              <>
                {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-gold-gradient italic">
                  {t("hero.title").split(" ").slice(-2).join(" ")}
                </span>
              </>
            )}
          </h1>

          <div className="hairline w-32 my-8" />
          
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {hero?.subheadline || t("hero.sub")}
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4">
            <a href={hero?.cta_url || "#contact"} className="btn-gold rounded-full px-7 py-3.5 inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {hero?.cta_text || t("hero.book")}
            </a>
            <a
              href={waLink(PRIMARY_WHATSAPP, msg)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold rounded-full px-7 py-3.5 inline-flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" /> {t("hero.whatsapp")}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] text-muted-foreground uppercase"
      >
        Vogue Cutts
      </motion.div>
    </section>
  );
}