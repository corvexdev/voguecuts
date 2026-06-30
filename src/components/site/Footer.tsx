import { useI18n } from "@/lib/i18n";
import { Scissors } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border py-12 px-6 lg:px-10">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-[color:var(--brand-red)] -rotate-12" />
          <span className="font-display text-lg">
            Vogue <span className="text-gold-gradient">Cutts</span>
          </span>
        </div>
        <div className="text-xs tracking-[0.3em] uppercase text-[color:var(--gold)]">
          {t("footer.tag")}
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vogue Cutts. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
