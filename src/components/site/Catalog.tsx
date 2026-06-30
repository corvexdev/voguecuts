import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import skinFade from "@/assets/cat-skin-fade.jpg";
import taper from "@/assets/cat-taper.jpg";
import beard from "@/assets/cat-beard.jpg";
import kids from "@/assets/cat-kids.jpg";
import classicImg from "@/assets/cat-classic.jpg";
import modernImg from "@/assets/cat-modern.jpg";

type Item = { cat: string; img: string; label: { sq: string; en: string } };

const CATS = [
  { key: "all", sq: "Të gjitha", en: "All" },
  { key: "fade", sq: "Fade", en: "Fade" },
  { key: "beard", sq: "Mjekrra", en: "Beard" },
  { key: "modern", sq: "Modern", en: "Modern" },
  { key: "classic", sq: "Klasike", en: "Classic" },
  { key: "kids", sq: "Fëmijë", en: "Kids" },
];

const ITEMS: Item[] = [
  { cat: "fade", img: skinFade, label: { sq: "Skin Fade", en: "Skin Fade" } },
  { cat: "fade", img: taper, label: { sq: "Taper Fade", en: "Taper Fade" } },
  { cat: "beard", img: beard, label: { sq: "Mjekër e plotë", en: "Full Beard" } },
  { cat: "modern", img: modernImg, label: { sq: "Frizurë moderne", en: "Modern Fringe" } },
  { cat: "classic", img: classicImg, label: { sq: "Klasike Pomadë", en: "Classic Side Part" } },
  { cat: "kids", img: kids, label: { sq: "Prerje për fëmijë", en: "Kids Cut" } },
];

export function Catalog() {
  const { t, lang } = useI18n();
  const [active, setActive] = useState("all");
  const filtered = active === "all" ? ITEMS : ITEMS.filter((i) => i.cat === active);

  return (
    <section id="catalog" className="py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[color:var(--gold)] mb-4">
            {t("catalog.eyebrow")}
          </div>
          <h2 className="font-display text-4xl lg:text-5xl">{t("catalog.title")}</h2>
          <div className="hairline w-32 mx-auto mt-6" />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`px-5 py-2 rounded-full text-sm tracking-wide transition-all ${
                active === c.key
                  ? "btn-gold"
                  : "border border-border text-muted-foreground hover:text-[color:var(--gold)] hover:border-[color:var(--gold)]/40"
              }`}
            >
              {lang === "sq" ? c.sq : c.en}
            </button>
          ))}
        </div>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((it, i) => (
              <motion.figure
                key={it.label.en}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: (i % 3) * 0.05 }}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-card"
              >
                <img
                  src={it.img}
                  alt={lang === "sq" ? it.label.sq : it.label.en}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <figcaption className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                  <span className="font-display text-lg text-foreground">
                    {lang === "sq" ? it.label.sq : it.label.en}
                  </span>
                  <span className="text-xs text-[color:var(--gold)] tracking-widest uppercase">
                    {CATS.find((c) => c.key === it.cat)?.[lang]}
                  </span>
                </figcaption>
                <div className="absolute inset-0 ring-1 ring-inset ring-[color:var(--gold)]/0 group-hover:ring-[color:var(--gold)]/40 transition-all" />
              </motion.figure>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
