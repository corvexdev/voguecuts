import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Sparkles, Users, Award, HeartHandshake } from "lucide-react";
import shopWide from "@/assets/shop-wide.asset.json";
import wallArt from "@/assets/wall-art.asset.json";
import lokali from "@/assets/lokali.jpg";
import biciklla from "@/assets/biciklla.jpg";

export function About() {
  const { t } = useI18n();
  const features = [
    { icon: Sparkles, t: t("about.f1.t"), d: t("about.f1.d") },
    { icon: Users, t: t("about.f2.t"), d: t("about.f2.d") },
    { icon: Award, t: t("about.f3.t"), d: t("about.f3.d") },
    { icon: HeartHandshake, t: t("about.f4.t"), d: t("about.f4.d") },
  ];

  return (
    <section id="about" className="relative py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <img src={lokali} alt="Vogue Cutts barbershop" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 ring-1 ring-inset ring-[color:var(--gold)]/20 rounded-2xl" />
            </div>
            <div className="hidden md:block absolute -bottom-8 -right-8 w-48 h-64 rounded-xl overflow-hidden ring-1 ring-[color:var(--gold)]/30 shadow-[var(--shadow-elegant)]">
              <img src={biciklla  } alt="Barbershop wall" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute -top-6 -left-6 w-24 h-24 border border-[color:var(--gold)]/40" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-xs tracking-[0.3em] uppercase text-[color:var(--gold)] mb-4">
              {t("about.eyebrow")}
            </div>
            <h2 className="font-display text-4xl lg:text-5xl leading-tight">
              {t("about.title")}
            </h2>
            <div className="hairline w-24 my-6" />
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t("about.body")}
            </p>
            <div className="mt-10 grid sm:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass rounded-xl p-5"
                >
                  <f.icon className="h-5 w-5 text-[color:var(--gold)] mb-3" />
                  <div className="font-medium text-foreground mb-1">{f.t}</div>
                  <div className="text-sm text-muted-foreground">{f.d}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
