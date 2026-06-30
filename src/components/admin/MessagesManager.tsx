import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageCircle, Shield, Trash2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminStatus } from "./useAdmin";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  status: string;
  created_at: string;
}

export default function MessagesManager() {
  const { isAdmin, loading: authLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  const [messageId, setMessageId] = useState<string | null>(null);
  const [info, setInfo] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: messages = [], isLoading, error } = useQuery<MessageItem[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const selectedMessage = messages.find((item) => item.id === messageId) ?? null;

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!messageId) throw new Error("Select a message first.");
      const { error } = await supabase.from("messages").update({ status: newStatus }).eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setInfo({ type: "success", text: "Message status updated." });
    },
    onError: (error: any) => {
      setInfo({ type: "error", text: error.message ?? "Failed to update status." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setMessageId(null);
      setInfo({ type: "success", text: "Message deleted." });
    },
    onError: (error: any) => {
      setInfo({ type: "error", text: error.message ?? "Failed to delete message." });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-12 text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-yellow-400" />
        <p className="text-sm text-zinc-400">Loading messages…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-12 text-center">
        <p className="text-lg font-semibold text-rose-100">Access denied</p>
        <p className="mt-2 text-sm text-zinc-400">Only admins may view inbound messages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {info && (
        <div className={`rounded-3xl border px-5 py-4 text-sm font-medium ${
          info.type === "success"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            : "border-rose-500/30 bg-rose-500/10 text-rose-100"
        }`}>
          {info.text}
        </div>
      )}

      <div className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-8">
        <div className="flex items-center gap-4">
          <MessageCircle size={24} className="text-yellow-400" />
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-400">Messages</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Customer inbox</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Use this panel to read, update status, and remove inbound contact messages securely.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-zinc-800/70 bg-[#090909] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Messages</h2>
            <span className="text-sm text-zinc-400">{messages.length} total</span>
          </div>
          <div className="space-y-3">
            {messages.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMessageId(item.id)}
                className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                  messageId === item.id
                    ? "border-yellow-400 bg-yellow-500/10"
                    : "border-zinc-800 bg-[#0b0b0d] hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-zinc-400">{item.email}</p>
                  </div>
                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-500">{item.subject || "No subject"}</p>
              </button>
            ))}
            {messages.length === 0 && <p className="text-sm text-zinc-400">No messages yet.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-6">
          <div className="flex items-center gap-4">
            <Shield size={20} className="text-yellow-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Message details</h2>
              <p className="text-sm text-zinc-400">Review and manage the selected request.</p>
            </div>
          </div>

          {selectedMessage ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-5">
                <p className="text-sm text-zinc-400">From</p>
                <p className="mt-1 font-semibold text-white">{selectedMessage.name} · {selectedMessage.email}</p>
                <p className="mt-2 text-sm text-zinc-500">{selectedMessage.subject || "No subject"}</p>
              </div>

              <div className="rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-5">
                <p className="text-sm text-zinc-400">Message</p>
                <p className="mt-3 text-sm leading-6 text-zinc-200">{selectedMessage.body}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => updateStatusMutation.mutate("open")}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-zinc-800 bg-[#0d0d0f] px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-400"
                >
                  <CheckCircle2 size={16} /> Mark Open
                </button>
                <button
                  type="button"
                  onClick={() => updateStatusMutation.mutate("closed")}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-zinc-800 bg-[#0d0d0f] px-4 py-3 text-sm font-semibold text-white transition hover:border-rose-500"
                >
                  <Trash2 size={16} /> Mark Closed
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(selectedMessage.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                >
                  <Trash2 size={16} /> Delete Message
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-6 text-sm text-zinc-400">
              Select a message from the list to view details and take action.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
