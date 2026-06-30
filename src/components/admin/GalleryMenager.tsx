import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAdminStatus } from "./useAdmin";
import {
  Upload,
  Trash2,
  Loader2,
  Edit3,
  CheckCircle2,
} from "lucide-react";

interface GalleryItem {
  id: string;
  image_url: string;
  title: string | null;
}

const getStoragePath = (url: string) => {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/storage/v1/object/public/gallery/")[1] ?? "");
  } catch {
    return url.split("/storage/v1/object/public/gallery/")[1] ?? "";
  }
};

const formatError = (error: unknown): string => {
  if (!error) return "Unknown error.";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error.";
  }
};

export default function GalleryManager() {
  const queryClient = useQueryClient();
  const { isAdmin, loading: authLoading } = useAdminStatus();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const canModify = isAdmin && !authLoading;

  const { data: images = [], isLoading, isError, error } = useQuery<GalleryItem[], Error>({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("id, image_url, title")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setMessage({ type: "error", text: "Admin access is required to manage gallery content." });
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!editFile) {
      setEditPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(editFile);
    setEditPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [editFile]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please choose an image first.");

      if (!canModify) {
        throw new Error("Admin access required to upload gallery images.");
      }

      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) throw new Error(formatError(uploadError));

      const { data: publicUrlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) throw new Error("Unable to generate public URL.");

      const { error: dbError } = await supabase.from("gallery").insert([
        {
          image_url: publicUrlData.publicUrl,
          title: title || null,
        },
      ]);

      if (dbError) throw new Error(formatError(dbError));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setFile(null);
      setTitle("");
      setMessage({ type: "success", text: "Image uploaded successfully." });
    },
    onError: (error: unknown) => {
      const messageText = formatError(error);
      console.error("Upload error:", error);
      setMessage({ type: "error", text: messageText });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItem) throw new Error("Select an item to update.");

      if (!canModify) {
        throw new Error("Admin access required to update gallery images.");
      }

      let image_url = selectedItem.image_url;

      if (editFile) {
        const fileName = `${Date.now()}-${editFile.name}`;
        const { error: uploadError } = await supabase.storage.from("gallery").upload(fileName, editFile, {
          cacheControl: "3600",
          upsert: false,
        });

        if (uploadError) throw new Error(formatError(uploadError));

        const { data: publicUrlData } = supabase.storage
          .from("gallery")
          .getPublicUrl(fileName);

        if (!publicUrlData?.publicUrl) throw new Error("Unable to generate public URL for the new image.");

        image_url = publicUrlData.publicUrl;
        const oldPath = getStoragePath(selectedItem.image_url);
        if (oldPath) {
          const { error: removeError } = await supabase.storage.from("gallery").remove([oldPath]);
          if (removeError) throw new Error(formatError(removeError));
        }
      }

      const { error: dbError } = await supabase
        .from("gallery")
        .update({ image_url, title: editTitle || null })
        .eq("id", selectedItem.id);

      if (dbError) throw new Error(formatError(dbError));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setSelectedItem(null);
      setEditTitle("");
      setEditFile(null);
      setMessage({ type: "success", text: "Gallery item updated successfully." });
    },
    onError: (error: unknown) => {
      const messageText = formatError(error);
      console.error("Update error:", error);
      setMessage({ type: "error", text: messageText });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: GalleryItem) => {
      if (!canModify) {
        throw new Error("Admin access required to delete gallery images.");
      }

      const filePath = getStoragePath(item.image_url);

      if (filePath) {
        const { error: removeError } = await supabase.storage.from("gallery").remove([filePath]);
        if (removeError) throw new Error(formatError(removeError));
      }

      const { error } = await supabase.from("gallery").delete().eq("id", item.id);
      if (error) throw new Error(formatError(error));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setMessage({ type: "success", text: "Gallery item deleted." });
      setSelectedItem(null);
      setEditTitle("");
      setEditFile(null);
    },
    onError: (error: unknown) => {
      const messageText = formatError(error);
      console.error("Delete error:", error);
      setMessage({ type: "error", text: messageText });
    },
  });

  const galleryEmpty = !isLoading && images.length === 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="rounded-3xl border border-zinc-800/70 bg-[#050505] p-8 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-400">Gallery Control</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Manage your gallery like a pro</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Upload new images, update captions, replace files, and delete older assets with a secure and professional interface.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/80 px-5 py-4 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Active items</p>
            <p className="mt-2 text-3xl font-semibold text-white">{images.length}</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`rounded-3xl border px-5 py-4 text-sm font-medium ${
          message.type === "success"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            : message.type === "error"
            ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
            : "border-sky-500/30 bg-sky-500/10 text-sky-100"
        }`}>
          {message.text}
        </div>
      )}

      {authLoading ? (
        <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/80 px-5 py-4 text-sm text-zinc-300">
          Checking admin session...
        </div>
      ) : !canModify ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
          Admin access is required to manage gallery content.
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
          Admin access confirmed.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-6 shadow-sm shadow-black/10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Upload new image</h2>
              <p className="mt-1 text-sm text-zinc-500">Add a fresh photo and optional caption to your gallery.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
              <Upload size={14} /> New
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block rounded-3xl border border-zinc-800/70 bg-zinc-950/70 p-4">
              <span className="text-sm font-medium text-zinc-300">Image title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Caption (optional)"
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </label>
            <label className="block rounded-3xl border border-zinc-800/70 bg-zinc-950/70 p-4">
              <span className="text-sm font-medium text-zinc-300">Image file</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="mt-3 block w-full text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-yellow-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950/80">
              <img src={previewUrl} alt="Preview" className="h-64 w-full object-cover" />
            </div>
          )}

          <button
            type="button"
            onClick={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending || !file || !canModify}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-3xl bg-linear-to-r from-yellow-400 to-amber-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-yellow-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Image
          </button>
        </section>

        <section className="rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-6 shadow-sm shadow-black/10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Update selected item</h2>
              <p className="mt-1 text-sm text-zinc-500">Choose a gallery card below to update its title or replace the photo.</p>
            </div>
            {selectedItem && (
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setEditTitle("");
                  setEditFile(null);
                }}
                className="rounded-full border border-zinc-700/70 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Clear
              </button>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/70 p-5 space-y-4">
            <label className="block rounded-3xl border border-zinc-800/70 bg-[#080808] p-4">
              <span className="text-sm font-medium text-zinc-300">Image title</span>
              <input
                value={selectedItem ? editTitle : ""}
                onChange={(event) => setEditTitle(event.target.value)}
                placeholder={selectedItem ? "Update caption" : "Select an item to edit"}
                disabled={!selectedItem}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="block rounded-3xl border border-zinc-800/70 bg-[#080808] p-4">
              <span className="text-sm font-medium text-zinc-300">Replace image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setEditFile(event.target.files?.[0] ?? null)}
                disabled={!selectedItem}
                className="mt-3 block w-full text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-yellow-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black disabled:cursor-not-allowed"
              />
            </label>

            {(selectedItem || editPreviewUrl) && (
              <div className="overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950/80">
                <img
                  src={editPreviewUrl ?? selectedItem?.image_url ?? ""}
                  alt="Selected preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => updateMutation.mutate()}
              disabled={!selectedItem || updateMutation.isPending || !canModify}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-3xl bg-linear-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save updates
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-zinc-800/70 bg-[#0b0b0d] p-5 shadow-sm shadow-black/10">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-zinc-800/70 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Gallery collection</h2>
            <p className="mt-1 text-sm text-zinc-500">Select a card to edit, or remove items from the gallery.</p>
          </div>
          <span className="text-sm text-zinc-400">{images.length} items</span>
        </div>

        {isError ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-100">
            <p className="font-medium">Failed to load gallery.</p>
            <p className="mt-2 text-zinc-200">{error?.message ?? "Confirm Supabase RLS policies and authentication."}</p>
          </div>
        ) : galleryEmpty ? (
          <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/80 p-8 text-center text-zinc-400">
            <p className="text-sm font-medium">No gallery items found yet.</p>
            <p className="mt-2 text-sm">Upload your first image with the form above.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((item) => {
              const active = selectedItem?.id === item.id;
              return (
                <article
                  key={item.id}
                  className={`group overflow-hidden rounded-3xl border transition duration-200 ${
                    active
                      ? "border-yellow-400/40 ring-1 ring-yellow-400/20"
                      : "border-zinc-800 bg-[#09090b] hover:border-zinc-600/80"
                  }`}
                >
                  <div className="relative">
                    <img src={item.image_url} alt={item.title ?? "Gallery image"} className="h-64 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 opacity-0 transition duration-300 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(item);
                          setEditTitle(item.title ?? "");
                          setEditFile(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-black/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(item)}
                        disabled={!canModify}
                        className="inline-flex items-center gap-2 rounded-2xl bg-rose-500/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white truncate">{item.title || "Untitled"}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(item);
                          setEditTitle(item.title ?? "");
                          setEditFile(null);
                        }}
                        className="rounded-full border border-zinc-700/70 bg-zinc-900/80 p-2 text-zinc-300 transition hover:border-yellow-400 hover:text-white"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">ID: {item.id}</p>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(item)}
                      disabled={!canModify}
                      className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/80 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete item
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
