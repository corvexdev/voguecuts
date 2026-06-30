import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Clock, Zap, Plus, Trash2, Edit3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminStatus } from "./useAdmin";
import { BARBERS } from "@/lib/business";

interface OpeningHour {
  id: string;
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  date?: string | null;
  barber?: string | null;
}

export default function HoursManager() {
  const { isAdmin, loading: authLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [isClosed, setIsClosed] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [barber, setBarber] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: hours = [], isLoading, error } = useQuery<OpeningHour[]>({
    queryKey: ["opening_hours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opening_hours")
        .select("*")
        .order("day_of_week", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!selectedId) {
      setDayOfWeek("Monday");
      setOpenTime("09:00");
      setCloseTime("18:00");
      setIsClosed(false);
      setDate(null);
      setBarber(null);
      return;
    }

    const selected = hours.find((hour) => hour.id === selectedId);
    if (selected) {
      setDayOfWeek(selected.day_of_week);
      setOpenTime(selected.open_time);
      setCloseTime(selected.close_time);
      setIsClosed(selected.is_closed);
      setDate(selected.date ?? null);
      setBarber(selected.barber ?? null);
    }
  }, [selectedId, hours]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!dayOfWeek.trim() && !date) {
        throw new Error("Either a weekday or a specific date is required.");
      }

      if (!isClosed && (!openTime || !closeTime)) {
        throw new Error("Open and close times are required when not closed.");
      }

      const payload: any = {
        day_of_week: dayOfWeek.trim(),
        open_time: openTime,
        close_time: closeTime,
        is_closed: isClosed,
        date: date || null,
        barber: barber || null,
      };

      if (selectedId) {
        const { error } = await supabase.from("opening_hours").update(payload).eq("id", selectedId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("opening_hours").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opening_hours"] });
      setSelectedId(null);
      setMessage({ type: "success", text: "Opening hour saved successfully." });
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message ?? "Failed to save opening hour." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opening_hours").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opening_hours"] });
      setSelectedId(null);
      setMessage({ type: "success", text: "Opening hour removed." });
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message ?? "Failed to remove opening hour." });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-12 text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-yellow-400" />
        <p className="text-sm text-zinc-400">Loading opening hours…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-12 text-center">
        <p className="text-lg font-semibold text-rose-100">Access denied</p>
        <p className="mt-2 text-sm text-zinc-400">Only admins can edit shop hours.</p>
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
            <Clock size={24} className="text-yellow-400" />
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-yellow-400">Opening Hours</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Manage shop hours</h1>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
              <span className="text-sm font-medium text-zinc-300">Day of week</span>
              <select
                value={dayOfWeek}
                onChange={(event) => setDayOfWeek(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </label>
            <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
              <span className="text-sm font-medium text-zinc-300">Open time</span>
              <input
                type="time"
                value={openTime}
                onChange={(event) => setOpenTime(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </label>
            <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
              <span className="text-sm font-medium text-zinc-300">Close time</span>
              <input
                type="time"
                value={closeTime}
                onChange={(event) => setCloseTime(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </label>
            <div className="flex items-center gap-3 rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
              <input
                type="checkbox"
                checked={isClosed}
                onChange={(event) => setIsClosed(event.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-yellow-400 focus:ring-yellow-400"
              />
              <span className="text-sm text-zinc-300">Closed this day</span>
            </div>
            <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
              <span className="text-sm font-medium text-zinc-300">Specific date (optional)</span>
              <input
                type="date"
                value={date ?? ""}
                onChange={(e) => setDate(e.target.value || null)}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </label>
            <label className="block rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
              <span className="text-sm font-medium text-zinc-300">Barber (optional)</span>
              <select
                value={barber ?? ""}
                onChange={(e) => setBarber(e.target.value || null)}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              >
                <option value="">All / Shop</option>
                {BARBERS.map((b) => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-3xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-yellow-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {selectedId ? "Update hours" : "Add hours"}
          </button>
        </section>

        <section className="rounded-3xl border border-zinc-800/70 bg-[#090909] p-8">
          <div className="flex items-center gap-3 text-zinc-300">
            <Zap size={20} className="text-yellow-400" />
            <p className="text-sm font-semibold text-white">Active schedule</p>
          </div>

          <div className="mt-6 space-y-4">
            {hours.map((hour) => (
              <div key={hour.id} className="rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{hour.day_of_week}</p>
                    <p className="text-sm text-zinc-400">{hour.is_closed ? "Closed" : `${hour.open_time} - ${hour.close_time}`}{hour.date ? ` — ${hour.date}` : ""}{hour.barber ? ` — ${hour.barber}` : ""}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(hour.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700/70 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-white transition hover:border-yellow-400"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(hour.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/70 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {hours.length === 0 && (
              <p className="text-sm text-zinc-400">No opening hours configured yet. Add the first day of operation.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
