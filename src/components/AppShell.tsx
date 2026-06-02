"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { LogoMark } from "@/components/Brand";

const NAV: { href: string; label: string; icon: string }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/upload", label: "Upload", icon: "📤" },
  { href: "/rechnungen", label: "Rechnungen", icon: "📋" },
  { href: "/freigaben", label: "Freigaben", icon: "✅" },
  { href: "/lieferanten", label: "Lieferanten", icon: "🏢" },
  { href: "/export", label: "DATEV-Export", icon: "📦" },
  { href: "/audit", label: "Audit-Trail", icon: "📖" },
  { href: "/einstellungen", label: "Einstellungen", icon: "⚙️" },
];

function roleLabel(role?: string) {
  const map: Record<string, string> = {
    admin: "Administrator",
    buchhalter: "Buchhaltung",
    freigeber: "Freigeber",
    viewer: "Leser",
  };
  return (role && map[role]) || role || "Benutzer";
}

function SidebarPanel({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#003856] text-white">
      <div className={`flex h-16 items-center gap-2.5 ${collapsed ? "justify-center px-0" : "px-5"}`}>
        <LogoMark className="h-8 w-8 shrink-0 ring-1 ring-white/15" />
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight">
            FlowCheck <span className="text-[#c8985a]">AI+</span>
          </span>
        )}
      </div>
      <nav className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={`border-t border-white/10 p-4 ${collapsed ? "text-center" : ""}`}>
        {!collapsed && (
          <p className="text-[11px] leading-tight text-white/50">
            SBS Deutschland
            <br />
            GmbH &amp; Co. KG
          </p>
        )}
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 md:block ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <SidebarPanel collapsed={collapsed} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <SidebarPanel collapsed={false} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className={`transition-[padding] duration-200 ${collapsed ? "md:pl-[76px]" : "md:pl-64"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#003856] hover:bg-stone-100 md:hidden"
              aria-label="Menü öffnen"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-[#003856] hover:bg-stone-100 md:flex"
              aria-label="Seitenleiste umschalten"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h10M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-stone-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003856] text-sm font-semibold text-white">
                {(user?.name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight text-stone-800">{user?.name || "—"}</p>
                <p className="text-xs leading-tight text-stone-500">{roleLabel(user?.role)}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden text-stone-400 sm:block">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl bg-white py-1 shadow-lg ring-1 ring-stone-200">
                  <div className="border-b border-stone-100 px-4 py-3">
                    <p className="truncate text-sm font-medium text-stone-800">{user?.name}</p>
                    <p className="truncate text-xs text-stone-500">{user?.email}</p>
                  </div>
                  <Link
                    href="/profil"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                  >
                    👤 Profil
                  </Link>
                  <Link
                    href="/einstellungen"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                  >
                    ⚙️ Einstellungen
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    ↩ Abmelden
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
