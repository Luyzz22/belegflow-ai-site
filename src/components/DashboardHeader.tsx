"use client";
import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/rechnungen", label: "Rechnungen", icon: "📄" },
  { href: "/dashboard/freigaben", label: "Freigaben", icon: "✅" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/spend", label: "Spend", icon: "💰" },
  { href: "/dashboard/budget", label: "Budget", icon: "📋" },
  { href: "/dashboard/copilot", label: "Copilot", icon: "🤖" },
];

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const [userMenu, setUserMenu] = useState(false);
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "BF";

  return (
    <>
      {/* Top Bar — SBS Blue */}
      <header className="sticky top-0 z-50" style={{ background: "linear-gradient(135deg, #003856 0%, #00507a 100%)", boxShadow: "0 2px 20px rgba(0,0,0,0.15)" }}>
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-[64px]">
          {/* Logo */}
          <a href="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-sm font-bold text-[#003856]"
              style={{ background: "linear-gradient(135deg, #FFB900 0%, #ff9500 100%)" }}>
              BF
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-[15px] leading-tight">BelegFlow AI</span>
              <span className="text-white/60 text-[11px]">E-Rechnung · KI</span>
            </div>
          </a>

          {/* Right: Actions + User */}
          <div className="flex items-center gap-3">
            <a href="/dashboard/rechnungen" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#003856] transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #FFB900 0%, #ff9500 100%)" }}>
              ⬆️ Rechnung hochladen
            </a>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
                  {initials}
                </div>
                <span className="hidden sm:block text-white/90 text-sm">{user?.name || user?.email?.split("@")[0]}</span>
                <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {userMenu && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#003856]/10 text-[#003856] text-[10px] font-semibold rounded-full">
                      {user?.role || "Professional"}
                    </span>
                  </div>
                  <a href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">⚙️ Einstellungen</a>
                  <a href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">👥 Team verwalten</a>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      🚪 Abmelden
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-1 h-[48px] overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#00385610] text-[#003856] font-semibold"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                style={isActive ? { borderBottom: "2px solid #FFB900", borderRadius: "8px 8px 0 0" } : {}}
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </a>
            );
          })}
          <div className="flex-1" />
          <a href="/dashboard/settings" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition">
            <span>⚙️</span><span className="hidden md:inline">Einstellungen</span>
          </a>
        </div>
      </nav>
    </>
  );
}
