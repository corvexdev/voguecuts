import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Settings, Lock, Plus, Trash2, Edit3, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminStatus } from "./useAdmin";

interface AppSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
}

export default function SettingsManager() {
  const { isAdmin, loading: authLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: settings = [], isLoading, error } = useQuery<AppSetting[]>({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .order("key", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!selectedId) {
      setKeyInput("");
      setValueInput("");
      setDescription("");
      return;
    }

    const selected = settings.find((item) => item.id === selectedId);
    if (selected) {
      setKeyInput(selected.key);
      setValueInput(typeof selected.value === "string" ? selected.value : JSON.stringify(selected.value));
      setDescription(selected.description ?? "");
    }
  }, [selectedId, settings]);

  const parseValue = (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!keyInput.trim()) {
        throw new Error("Setting key is required.");
      }

      const payload = {
        key: keyInput.trim(),
        value: parseValue(valueInput.trim()),
        description: description.trim() || null,
      };

      if (selectedId) {
        const { error } = await supabase.from("app_settings").update(payload).eq("id", selectedId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("app_settings").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app_settings"] });
      setSelectedId(null);
      setMessage({ type: "success", text: "Setting saved successfully." });
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message ?? "Failed to save setting." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("app_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app_settings"] });
      setSelectedId(null);
      setMessage({ type: "success", text: "Setting removed." });
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message ?? "Failed to remove setting." });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-12 text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-yellow-400" />
        <p className="text-sm text-zinc-400">Loading settings…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-12 text-center">
        <p className="text-lg font-semibold text-rose-100">Access denied</p>
        <p className="mt-2 text-sm text-zinc-400">Only admins may update application settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className={`rounded-3xl border px-5 py-4 text-sm font-medium ${
          message.type === "success"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            : "border-rose-500/30 bg-rose-500/10 text-rose-100"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Settings size={24} className="text-yellow-400" />
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-yellow-400">App Settings</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Manage configuration</h1>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
              <span className="text-sm font-medium text-zinc-300">Key</span>
              <input
                value={keyInput}
                onChange={(event) => setKeyInput(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </label>

            <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
              <span className="text-sm font-medium text-zinc-300">Value</span>
              <textarea
                value={valueInput}
                onChange={(event) => setValueInput(event.target.value)}
                rows={4}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </label>

            <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
              <span className="text-sm font-medium text-zinc-300">Description</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-3xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-yellow-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {selectedId ? "Update setting" : "Create setting"}
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="inline-flex items-center gap-2 rounded-3xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-yellow-400"
              >
                <Edit3 size={16} /> Clear selection
              </button>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800/70 bg-[#090909] p-8">
          <div className="flex items-center gap-3 text-zinc-300">
            <Lock size={20} className="text-yellow-400" />
            <p className="text-sm font-semibold text-white">Current settings</p>
          </div>

          <div className="mt-6 space-y-4">
            {settings.map((item) => (
              <div key={item.id} className="rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-300 uppercase tracking-[0.2em]">{item.key}</p>
                    <p className="mt-2 text-sm text-zinc-200 break-words">{typeof item.value === "object" ? JSON.stringify(item.value) : String(item.value)}</p>
                    {item.description && <p className="mt-2 text-xs text-zinc-500">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700/70 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-white transition hover:border-yellow-400"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/70 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {settings.length === 0 && <p className="text-sm text-zinc-400">No app settings configured yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
