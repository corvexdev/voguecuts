import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users, ShieldCheck, Trash2, Edit3, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminStatus } from "./useAdmin";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  visible: boolean;
  display_order: number;
}

export default function TeamManager() {
  const { isAdmin, loading: authLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [visible, setVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!selectedId) {
      setName("");
      setRole("");
      setBio("");
      setImageUrl("");
      setVisible(true);
      setDisplayOrder(0);
      return;
    }

    const selected = members.find((member) => member.id === selectedId);
    if (selected) {
      setName(selected.name);
      setRole(selected.role);
      setBio(selected.bio ?? "");
      setImageUrl(selected.image_url ?? "");
      setVisible(selected.visible);
      setDisplayOrder(selected.display_order ?? 0);
    }
  }, [selectedId, members]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `team/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("team-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("team-images").getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (error: any) {
      setMessage({ type: "error", text: "Error uploading image: " + error.message });
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !role.trim()) throw new Error("Name and role are required.");

      const payload = {
        name: name.trim(),
        role: role.trim(),
        bio: bio.trim() || null,
        image_url: imageUrl.trim() || null,
        visible,
        display_order: Number(displayOrder) || 0,
      };

      if (selectedId) {
        const { error } = await supabase.from("team_members").update(payload).eq("id", selectedId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("team_members").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      setSelectedId(null);
      setMessage({ type: "success", text: "Team member saved successfully." });
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message ?? "Failed to save." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      setMessage({ type: "success", text: "Team member deleted." });
    },
  });

  if (authLoading || isLoading) return <div className="p-12 text-center text-zinc-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</div>;
  if (!isAdmin) return <div className="p-12 text-center text-rose-400">Access denied.</div>;

  return (
    <div className="space-y-8">
      {message && <div className={`p-4 rounded-xl ${message.type === "success" ? "bg-emerald-500/10 text-emerald-100" : "bg-rose-500/10 text-rose-100"}`}>{message.text}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-8 space-y-6">
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3"><Users className="text-yellow-400" /> Manage team</h1>
          
          <div className="grid gap-4 lg:grid-cols-2">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl bg-[#0b0b0d] border border-zinc-800 p-3 text-white" />
            <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-2xl bg-[#0b0b0d] border border-zinc-800 p-3 text-white" />
            <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} className="lg:col-span-2 w-full rounded-2xl bg-[#0b0b0d] border border-zinc-800 p-3 text-white" />
            
            <label className="lg:col-span-2 block rounded-2xl border border-zinc-800 bg-[#0b0b0d] p-4">
              <span className="text-sm text-zinc-400">Profile Photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="block w-full mt-2 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-yellow-400 file:text-black cursor-pointer" />
              {imageUrl && <img src={imageUrl} alt="Preview" className="mt-4 h-20 w-20 rounded-full object-cover" />}
            </label>

            <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} className="w-full rounded-2xl bg-[#0b0b0d] border border-zinc-800 p-3 text-white" />
            <div className="flex items-center gap-2"><input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="h-4 w-4" /> Visible</div>
          </div>

          <button onClick={() => saveMutation.mutate()} className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold">{selectedId ? "Update" : "Add"} Member</button>
        </section>

        <section className="rounded-3xl border border-zinc-800/70 bg-[#090909] p-8">
          <h2 className="text-white font-semibold mb-6 flex items-center gap-2"><ShieldCheck className="text-yellow-400" /> Current Roster</h2>
          {members.map((m) => (
            <div key={m.id} className="bg-[#0b0b0d] p-4 rounded-2xl mb-4 flex justify-between items-center border border-zinc-800">
              <span>{m.name}</span>
              <div className="flex gap-2">
                <button onClick={() => setSelectedId(m.id)}><Edit3 size={16} /></button>
                <button onClick={() => deleteMutation.mutate(m.id)} className="text-rose-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}