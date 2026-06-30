import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, ImagePlus, Save, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminStatus } from "./useAdmin";

interface HeroSection {
  id: string;
  headline: string;
  subheadline: string | null;
  cta_text: string | null;
  cta_url: string | null;
  background_image_url: string | null;
  lang: string;
}

export default function HeroManager() {
  const { isAdmin, loading: authLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  
  // SHTESË: Gjendja për gjuhën
  const [lang, setLang] = useState<"sq" | "en">("sq");
  
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // NDRYSHIM: Shtohet 'lang' në queryKey dhe filtrimi .eq("lang", lang)
  const { data: hero, isLoading, error } = useQuery<HeroSection | null>({
    queryKey: ["hero_section", lang],
    queryFn: async () => {
      const { data, error } = await supabase.from("hero_section").select("*").eq("lang", lang).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!hero) {
      setHeadline("");
      setSubheadline("");
      setCtaText("");
      setCtaUrl("");
      setBackgroundImageUrl("");
      return;
    }

    setHeadline(hero.headline ?? "");
    setSubheadline(hero.subheadline ?? "");
    setCtaText(hero.cta_text ?? "");
    setCtaUrl(hero.cta_url ?? "");
    setBackgroundImageUrl(hero.background_image_url ?? "");
  }, [hero]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!headline.trim()) {
        throw new Error("Headline is required.");
      }

      const payload = {
        headline: headline.trim(),
        subheadline: subheadline.trim() || null,
        cta_text: ctaText.trim() || null,
        cta_url: ctaUrl.trim() || null,
        background_image_url: backgroundImageUrl.trim() || null,
        lang, // SHTESË: Ruajmë gjuhën
      };

      if (hero?.id) {
        const { error } = await supabase.from("hero_section").update(payload).eq("id", hero.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hero_section").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero_section", lang] });
      setMessage({ type: "success", text: `Hero section (${lang.toUpperCase()}) saved successfully.` });
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message ?? "Failed to save hero section." });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-12 text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-yellow-400" />
        <p className="text-sm text-zinc-400">Loading hero content…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-12 text-center">
        <p className="text-lg font-semibold text-rose-100">Access denied</p>
        <p className="mt-2 text-sm text-zinc-400">Only admins may edit homepage hero content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SHTESË: Butonat për përzgjedhje të gjuhës */}
      <div className="flex gap-3">
        <button onClick={() => setLang("sq")} className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition ${lang === 'sq' ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-400"}`}>SQ</button>
        <button onClick={() => setLang("en")} className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition ${lang === 'en' ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-400"}`}>EN</button>
      </div>

      {message && (
        <div className={`rounded-3xl border px-5 py-4 text-sm font-medium ${
          message.type === "success"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            : "border-rose-500/30 bg-rose-500/10 text-rose-100"
        }`}>
          {message.text}
        </div>
      )}

      <div className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Sparkles size={24} className="text-yellow-400" />
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-400">Hero Section ({lang.toUpperCase()})</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Edit homepage hero content</h1>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
            <span className="text-sm font-medium text-zinc-300">Headline</span>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" />
          </label>

          <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
            <span className="text-sm font-medium text-zinc-300">Subheadline</span>
            <input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" />
          </label>

          <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
            <span className="text-sm font-medium text-zinc-300">CTA Text</span>
            <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" />
          </label>

          <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
            <span className="text-sm font-medium text-zinc-300">CTA URL</span>
            <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" />
          </label>

          <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4 lg:col-span-2">
            <span className="text-sm font-medium text-zinc-300">Background Image URL</span>
            <input value={backgroundImageUrl} onChange={(e) => setBackgroundImageUrl(e.target.value)} className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" />
          </label>
        </div>

        <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="inline-flex items-center gap-2 rounded-3xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-yellow-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save hero section ({lang.toUpperCase()})
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-800/70 bg-[#090909] p-8">
        <div className="flex items-center gap-3 text-zinc-300">
          <ImagePlus size={20} className="text-yellow-400" />
          <p className="text-sm font-semibold text-white">Live preview</p>
        </div>
        <div className="mt-4 rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Current hero copy ({lang.toUpperCase()})</p>
          <h2 className="mt-3 text-2xl font-bold text-white">{headline || "Add your hero headline here."}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{subheadline || "Use this area to communicate your premium brand promise."}</p>
        </div>
      </div>
    </div>
  );
}