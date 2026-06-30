import { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Loader2, Plus, Trash2, X, Save, Clock,
  AlertCircle, Scissors, Tag, Euro
} from "lucide-react";

interface Service {
  id: string;
  sq_name: string;
  en_name: string;
  sq_desc: string | null;
  en_desc: string | null;
  price: number;
  duration: string;
}

interface FormData {
  sq_name: string;
  en_name: string;
  sq_desc: string;
  en_desc: string;
  price: string;
  duration: string;
}

export default function ServicesManager() {
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    sq_name: "",
    en_name: "",
    sq_desc: "",
    en_desc: "",
    price: "",
    duration: ""
  });

  // ✅ Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAdmin(!!session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ FETCH SERVICES
  const { data: services = [], isLoading, error } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("SUPABASE FETCH ERROR:", error);
        throw error;
      }

      return data ?? [];
    },
  });

  // ❌ show real error instead of silent fail
  if (error) {
    return (
      <div className="p-6 text-red-500 flex items-center gap-2">
        <AlertCircle />
        Failed to load services. Check Supabase console.
      </div>
    );
  }

  // ✅ ADD SERVICE
  const addMutation = useMutation({
    mutationFn: async (newService: FormData) => {
      if (!newService.en_name || !newService.price) {
        throw new Error("English name and price required");
      }

      const { error } = await supabase.from("services").insert([
        {
          sq_name: newService.sq_name,
          en_name: newService.en_name,
          sq_desc: newService.sq_desc || null,
          en_desc: newService.en_desc || null,
          price: Number(newService.price),
          duration: newService.duration
        }
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsAdding(false);
      setFormData({
        sq_name: "",
        en_name: "",
        sq_desc: "",
        en_desc: "",
        price: "",
        duration: ""
      });
    },
    onError: (err: any) => alert(err.message),
  });

  // ✅ DELETE SERVICE
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // ✅ SAFE FILTER
  const filteredServices = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return services.filter((s) => {
      return (
        s.en_name?.toLowerCase().includes(term) ||
        s.sq_name?.toLowerCase().includes(term) ||
        s.en_desc?.toLowerCase().includes(term) ||
        s.sq_desc?.toLowerCase().includes(term)
      );
    });
  }, [services, searchTerm]);

  const handlePublish = () => {
    if (!isAdmin) return alert("Unauthorized");
    addMutation.mutate(formData);
  };

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-yellow-500" size={40} />
        <p className="text-zinc-500">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-[#050505] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Services</h1>
          <p className="text-zinc-500">Manage barber services</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-yellow-500 text-black px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "New Service"}
        </button>
      </div>

      {/* FORM */}
      {isAdding && (
        <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl space-y-4">

          <input
            placeholder="English Name"
            className="w-full p-3 bg-black border border-zinc-800 rounded"
            value={formData.en_name}
            onChange={(e) =>
              setFormData({ ...formData, en_name: e.target.value })
            }
          />

          <input
            placeholder="Albanian Name"
            className="w-full p-3 bg-black border border-zinc-800 rounded"
            value={formData.sq_name}
            onChange={(e) =>
              setFormData({ ...formData, sq_name: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price"
              className="p-3 bg-black border border-zinc-800 rounded"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />

            <input
              placeholder="Duration"
              className="p-3 bg-black border border-zinc-800 rounded"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
            />
          </div>

          <textarea
            placeholder="English Description"
            className="w-full p-3 bg-black border border-zinc-800 rounded"
            value={formData.en_desc}
            onChange={(e) =>
              setFormData({ ...formData, en_desc: e.target.value })
            }
          />

          <textarea
            placeholder="Albanian Description"
            className="w-full p-3 bg-black border border-zinc-800 rounded"
            value={formData.sq_desc}
            onChange={(e) =>
              setFormData({ ...formData, sq_desc: e.target.value })
            }
          />

          <button
            onClick={handlePublish}
            disabled={addMutation.isPending}
            className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold"
          >
            {addMutation.isPending ? "Saving..." : "Publish Service"}
          </button>
        </div>
      )}

      {/* LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((svc) => (
          <div
            key={svc.id}
            className="bg-[#0a0a0a] border border-zinc-900 p-5 rounded-2xl"
          >
            <div className="flex justify-between">
              <Scissors className="text-yellow-500" />

              <button onClick={() => deleteMutation.mutate(svc.id)}>
                <Trash2 className="text-zinc-600 hover:text-red-500" />
              </button>
            </div>

            <h2 className="text-white text-lg font-bold mt-3">
              {svc.en_name}
            </h2>

            <p className="text-zinc-500 text-sm mt-2">
              {svc.en_desc}
            </p>

            <div className="flex justify-between mt-4 text-sm">
              <span className="text-zinc-400 flex items-center gap-1">
                <Clock size={14} /> {svc.duration}
              </span>

              <span className="text-yellow-500 font-bold flex items-center gap-1">
                <Euro size={14} /> {svc.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}