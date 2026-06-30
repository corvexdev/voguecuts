import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Scissors } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";

const SECTIONS = [
  ["nav.about", "about"],
  ["nav.services", "services"],
  ["nav.catalog", "catalog"],
  ["nav.gallery", "gallery"],
  ["nav.team", "team"],
  ["nav.training", "training"],
  ["nav.contact", "contact"],
] as const;

export function Header() {
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLang = (l: Lang) => setLang(l);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-10 h-16 lg:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Scissors className="h-5 w-5 text-[color:var(--brand-red)] -rotate-12" />
          <span className="font-display text-xl lg:text-2xl tracking-wide">
            <span className="text-foreground">Vogue</span>{" "}
            <span className="text-gold-gradient">Cutts</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {SECTIONS.map(([k, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-sm tracking-wide text-muted-foreground hover:text-[color:var(--gold)] transition-colors"
            >
              {t(k)}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => switchLang("sq")}
              className={`px-2 py-1 rounded ${lang === "sq" ? "text-[color:var(--gold)]" : "text-muted-foreground hover:text-foreground"}`}
            >
              SQ
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => switchLang("en")}
              className={`px-2 py-1 rounded ${lang === "en" ? "text-[color:var(--gold)]" : "text-muted-foreground hover:text-foreground"}`}
            >
              EN
            </button>
          </div>
          <a
            href="#contact"
            className="btn-gold rounded-full px-5 py-2.5 text-sm"
          >
            {t("nav.book")}
          </a>
        </div>

        <button
          className="lg:hidden text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border overflow-hidden"
          >
            <div className="px-5 py-6 flex flex-col gap-4">
              {SECTIONS.map(([k, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className="text-base text-foreground/90 hover:text-[color:var(--gold)]"
                >
                  {t(k)}
                </a>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <button
                  onClick={() => switchLang("sq")}
                  className={`px-3 py-1 rounded ${lang === "sq" ? "text-[color:var(--gold)]" : "text-muted-foreground"}`}
                >
                  SQ
                </button>
                <button
                  onClick={() => switchLang("en")}
                  className={`px-3 py-1 rounded ${lang === "en" ? "text-[color:var(--gold)]" : "text-muted-foreground"}`}
                >
                  EN
                </button>
              </div>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="btn-gold rounded-full px-5 py-3 text-sm text-center"
              >
                {t("nav.book")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
