import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "../../lib/supabase"; 
import ServicesManager from "./ServicesMenager";
import GalleryManager from "./GalleryMenager";
import HeroManager from "./HeroManager";
import TeamManager from "./TeamManager";
import HoursManager from "./HoursManager";
import MessagesManager from "./MessagesManager";
import SettingsManager from "./SettingsManager";
import { useAdminStatus } from "./useAdmin";

import {
  LayoutDashboard,
  Home,
  Scissors,
  Image as ImageIcon,
  Users,
  Clock,
  Settings,
  MessageSquare,
  Bell,
  Search,
  Plus,
  Calendar,
  DollarSign,
  Eye,
  TrendingUp,
  ChevronRight,
  LogOut,
  ArrowUpRight,
} from "lucide-react";

const menu = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "hero", title: "Hero Section", icon: Home },
  { id: "services", title: "Services", icon: Scissors },
  { id: "gallery", title: "Gallery", icon: ImageIcon },
  { id: "team", title: "Our Team", icon: Users },
  { id: "hours", title: "Opening Hours", icon: Clock },
  { id: "messages", title: "Messages", icon: MessageSquare },
  { id: "settings", title: "Settings", icon: Settings },
];

const stats = [
  { title: "Total Bookings", value: "26", change: "+12% vs last week", icon: Calendar, color: "from-amber-500/20 to-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { title: "Monthly Revenue", value: "€1,250", change: "+8.4% growth", icon: DollarSign, color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20" },
  { title: "Web Visitors", value: "1,482", change: "+4.2% bounce rate down", icon: Eye, color: "from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/20" },
  { title: "Conversion Rate", value: "18.3%", change: "+2.1% performance", icon: TrendingUp, color: "from-purple-500/20 to-fuchsia-500/10 text-purple-400 border-purple-500/20" },
];

const activities = [
  { id: 1, type: "booking", title: "New Appointment", user: "Filan Fisteku", service: "Haircut & Beard", time: "2 mins ago", status: "Confirmed" },
  { id: 2, type: "gallery", title: "Gallery Updated", user: "Admin", service: "Added 4 new photos", time: "20 mins ago", status: "Updated" },
  { id: 3, type: "service", title: "Service Premium Price Edited", user: "Manager", service: "Fade Cut -> €15", time: "1 hour ago", status: "Modified" },
  { id: 4, type: "booking", title: "Appointment Cancelled", user: "John Doe", service: "Hair Dye", time: "3 hours ago", status: "Cancelled" },
];

export default function Admin() {
  const [active, setActive] = useState("dashboard");
  const navigate = useNavigate();
  const { isAdmin, user, loading } = useAdminStatus();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate({ to: "/admin/dashboard-4Nw83Pd" });
    }
  }, [isAdmin, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/dashboard-4Nw83Pd" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 text-sm font-medium tracking-wide">Duke verifikuar autorizimin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 text-sm font-mono">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans selection:bg-yellow-400 selection:text-black">
      
      {/* Sidebar */}
      <aside className="w-72 bg-[#0c0c0e] border-r border-zinc-800/60 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/10">
                <Scissors size={20} className="text-black stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  Vogue <span className="text-yellow-400 font-medium">Cutts</span>
                </h1>
                <p className="text-zinc-500 text-xs font-medium tracking-wider uppercase mt-0.5">
                  Premium Panel
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menu.map((item) => {
              const Icon = item.icon;
              const isSelected = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                    isSelected
                      ? "bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-semibold shadow-md shadow-yellow-400/10"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon size={18} className={`transition-transform duration-200 group-hover:scale-105 ${isSelected ? "stroke-[2.5]" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                    {item.title}
                  </div>
                  {!isSelected && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-zinc-600 transform translate-x-[-4px] group-hover:translate-x-0" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Account */}
        <div className="p-4 border-t border-zinc-800/60 bg-[#0a0a0c]">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900/60 transition duration-200">
            <div className="flex items-center gap-3 min-w-0">
              {user?.avatar?.startsWith("http") ? (
                <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-zinc-700" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-yellow-400 shrink-0">
                  {user?.avatar || "A"}
                </div>
              )}
              <div className="truncate">
                <p className="text-sm font-medium text-zinc-200 truncate">{user?.name}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-800 shrink-0"
              title="Dil nga paneli"
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="text-[11px] text-zinc-600 text-center mt-3 tracking-wide">
            Vogue Cutts © 2026
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 border-b border-zinc-800/60 bg-[#0c0c0e]/50 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-50">
          <div>
            <h2 className="text-2xl font-bold tracking-tight capitalize text-zinc-100">
              {active === "dashboard" ? "Overview Dashboard" : active}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Mirëseerdhe prapë, {user?.name?.split(" ")[0]}! Ja çfarë po ndodh sot.
            </p>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Kërko diçka..." 
                className="w-64 h-10 pl-10 pr-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm placeholder-zinc-500 focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all"
              />
            </div>

            <button className="w-10 h-10 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-10 flex-1 overflow-y-auto">
          {active === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className="bg-[#0c0c0e] rounded-2xl p-6 border border-zinc-800/70 hover:border-zinc-700 transition-all duration-300 relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{card.title}</p>
                          <h2 className="text-3xl font-bold tracking-tight mt-2 text-white">{card.value}</h2>
                          <p className="text-xs text-zinc-400 mt-1.5 font-medium">{card.change}</p>
                        </div>
                        <div className={`p-3 rounded-xl border bg-gradient-to-br ${card.color}`}>
                          <Icon size={20} className="stroke-[2.2]" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800 group-hover:bg-yellow-400/30 transition-colors" />
                    </div>
                  );
                })}
              </div>

              {/* Feed & Quick Actions */}
              <div className="grid lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 bg-[#0c0c0e] rounded-2xl border border-zinc-800/70 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-100">Aktivitetet e Fundit</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Veprimet live nga uebsajti juaj</p>
                      </div>
                      <button className="text-xs font-medium text-yellow-400 hover:underline flex items-center gap-1">
                        Shiko të gjitha <ArrowUpRight size={14} />
                      </button>
                    </div>

                    <div className="divide-y divide-zinc-800/50">
                      {activities.map((act) => (
                        <div key={act.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 group">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${act.status === "Confirmed" ? "bg-emerald-500" : act.status === "Cancelled" ? "bg-red-500" : "bg-yellow-400"}`} />
                            <div>
                              <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                                {act.title} <span className="text-zinc-500 text-xs font-normal">nga {act.user}</span>
                              </p>
                              <p className="text-xs text-zinc-400 mt-0.5">{act.service}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">{act.status}</span>
                            <p className="text-[11px] text-zinc-500 mt-1">{act.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0c0c0e] rounded-2xl border border-zinc-800/70 p-6">
                  <h3 className="text-lg font-bold text-zinc-100 mb-1">Veprime të Shpejta</h3>
                  <p className="text-xs text-zinc-500 mb-6">Menaxho dyqanin me një klikim</p>
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-md shadow-yellow-400/5">
                      <Plus size={18} className="stroke-[2.5]" /> Shto Shërbim të Ri
                    </button>
                    <button className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/80 rounded-xl py-3 text-sm font-medium text-zinc-200 hover:text-white transition-all">Ngarko Foto në Galeri</button>
                    <button className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/80 rounded-xl py-3 text-sm font-medium text-zinc-200 hover:text-white transition-all">Shto Barber (Staf)</button>
                    <button className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/80 rounded-xl py-3 text-sm font-medium text-zinc-200 hover:text-white transition-all">Ndrysho Orarin e Punës</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Subpages View */}
        {/* Services */}
{active === "services" && <ServicesManager />}
{active === "gallery" && <GalleryManager />}

{/* Other Pages */}
{active === "hero" && <HeroManager />}
{active === "team" && <TeamManager />}
{active === "hours" && <HoursManager />}
{active === "messages" && <MessagesManager />}
{active === "settings" && <SettingsManager />}
{active !== "dashboard" && active !== "services" && active !== "gallery" && active !== "hero" && active !== "team" && active !== "hours" && active !== "messages" && active !== "settings" && (
  <div className="bg-[#0c0c0e] rounded-2xl border border-zinc-800/70 p-12 text-center max-w-2xl mx-auto mt-10">
    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
      {(() => {
        const Icon = menu.find((m) => m.id === active)?.icon || Settings;
        return <Icon size={28} />;
      })()}
    </div>

    <h2 className="text-2xl font-bold tracking-tight text-white capitalize">
      Seksioni: {menu.find((m) => m.id === active)?.title}
    </h2>

    <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
      Këtu mund të ndërtosh menaxhimin e plotë për këtë faqe.
    </p>
  </div>
)}
</main>

</div>

</div>
);
}