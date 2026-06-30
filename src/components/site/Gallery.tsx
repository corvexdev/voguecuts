import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

interface GalleryItem {
  id: string;
  image_url: string;
  title: string | null;
}

export function Gallery() {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>(null);

  // Tërheqja e fotove nga Supabase
  const { data: images = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("id, image_url, title")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // ESC to close + scroll lock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <section id="gallery" className="py-28 lg:py-36 bg-[color:var(--surface)]/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[color:var(--gold)] mb-4">
            {t("gallery.eyebrow")}
          </div>
          <h2 className="font-display text-4xl lg:text-5xl">{t("gallery.title")}</h2>
          <div className="hairline w-32 mx-auto mt-6" />
        </div>

        {/* GRID */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[color:var(--gold)]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[180px] lg:auto-rows-[220px] gap-3">
            {images.map((img, i) => (
              <motion.button
                key={img.id}
                onClick={() => setOpen(img.image_url)}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                // Shtova logjike për të bërë grid-in dinamik (ose mund t'i heqësh klasat span nëse do t'i mbash të gjitha njësoj)
                className={`group relative overflow-hidden rounded-xl bg-card ${i % 3 === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
                aria-label={img.title || "Gallery image"}
              >
                <img
                  src={img.image_url}
                  alt={img.title || "Gallery image"}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                <div className="absolute inset-0 ring-1 ring-inset ring-[color:var(--gold)]/0 group-hover:ring-[color:var(--gold)]/50 transition-all" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-[color:var(--gold)]"
            >
              <X className="h-7 w-7" />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              src={open}
              alt="Gallery preview"
              className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl ring-1 ring-[color:var(--gold)]/30"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}