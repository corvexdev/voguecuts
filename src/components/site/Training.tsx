import { motion } from "framer-motion";
import { Check, MessageCircle, GraduationCap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PRIMARY_WHATSAPP, waLink } from "@/lib/business";

export function Training() {
  const { t, lang } = useI18n();
  const conditions = [
    t("training.c1"),
    t("training.c2"),
    t("training.c3"),
    t("training.c4"),
    t("training.c5"),
  ];
  const msg =
    lang === "sq"
      ? "Përshëndetje! Jam i interesuar për praktikën profesionale në Vogue Cutts."
      : "Hello! I'm interested in the professional training program at Vogue Cutts.";

  return (
    <section id="training" className="relative py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.78_0.13_80_/_0.08),transparent_70%)]" />
      <div className="relative mx-auto max-w-5xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass rounded-3xl p-8 lg:p-14 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-[color:var(--gold)]/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[color:var(--brand-red)]/10 blur-3xl rounded-full" />

          <div className="relative">
            <div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[color:var(--gold)] mb-4">
              <GraduationCap className="h-4 w-4" />
              {t("training.eyebrow")}
            </div>
            <h2 className="font-display text-3xl lg:text-5xl leading-tight max-w-3xl">
              {t("training.title")}
            </h2>
            <div className="hairline w-24 my-8" />
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
              {t("training.body")}
            </p>

            <ul className="mt-10 grid sm:grid-cols-2 gap-4">
              {conditions.map((c, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--gold)]/15 text-[color:var(--gold)]">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-foreground/90">{c}</span>
                </motion.li>
              ))}
            </ul>

            <p className="mt-8 text-sm text-muted-foreground italic max-w-3xl">
              {t("training.note")}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={waLink(PRIMARY_WHATSAPP, msg)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold rounded-full px-7 py-3 inline-flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" /> {t("training.apply")}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
