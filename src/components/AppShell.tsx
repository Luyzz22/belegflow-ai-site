"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Upload,
  Zap,
  FileText,
  CheckCircle2,
  Building2,
  Landmark,
  ScrollText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { flowcheckApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { LogoMark } from "@/components/Brand";
import Breadcrumbs, { ROUTE_LABELS } from "@/components/Breadcrumbs";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/review", label: "Review", icon: Zap },
  { href: "/rechnungen", label: "Rechnungen", icon: FileText },
  { href: "/freigaben", label: "Freigaben", icon: CheckCircle2 },
  { href: "/lieferanten", label: "Lieferanten", icon: Building2 },
  { href: "/export", label: "DATEV-Export", icon: Landmark },
  { href: "/audit", label: "Audit-Trail", icon: ScrollText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

function roleLabel(role?: string) {
  const map: Record<string, string> = {
    admin: "Administrator",
    user: "Benutzer",
    buchhalter: "Buchhaltung",
    freigeber: "Freigeber",
    viewer: "Leser",
  };
  return (role && map[role]) || role || "Benutzer";
}

function SidebarPanel({
  collapsed,
  pathname,
  user,
  reviewCount,
  onLogout,
  onNavigate,
  onToggleCollapse,
}: {
  collapsed: boolean;
  pathname: string;
  user: { name?: string; email?: string; role?: string } | null;
  reviewCount: number;
  onLogout: () => void;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}) {
  const initial = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex h-full flex-col bg-[#003856] text-white">
      {/* Logo */}
      <div className={`flex h-16 items-center gap-2.5 ${collapsed ? "justify-center px-0" : "px-5"}`}>
        <LogoMark className="h-8 w-8 shrink-0 ring-1 ring-white/15" />
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight">
            FlowCheck <span className="text-[#c8985a]">AI+</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {active && (
                <span className="fc-indicator absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#c8985a]" />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {item.href === "/review" && reviewCount > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffb900] px-1.5 text-[11px] font-bold text-[#003856] ${
                    collapsed ? "absolute right-1 top-1" : ""
                  }`}
                >
                  {reviewCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + actions */}
      <div className="border-t border-white/10 p-3">
        <div className={`flex items-center gap-3 rounded-xl px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c8985a] text-sm font-semibold text-[#003856]">
            {initial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">{user?.name || "—"}</p>
              <p className="truncate text-xs leading-tight text-white/55">{roleLabel(user?.role)}</p>
            </div>
          )}
        </div>

        <div className={`mt-1 flex ${collapsed ? "flex-col items-center gap-1" : "items-center gap-1"}`}>
          <Link
            href="/profil"
            onClick={onNavigate}
            title="Profil"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/65 transition hover:bg-white/5 hover:text-white ${
              collapsed ? "justify-center" : "flex-1"
            }`}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && "Profil"}
          </Link>
          <button
            onClick={onLogout}
            title="Abmelden"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/65 transition hover:bg-white/5 hover:text-rose-300 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Abmelden"}
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Ausklappen" : "Einklappen"}
            className="mt-2 hidden w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/55 transition hover:bg-white/5 hover:text-white md:flex"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && "Einklappen"}
          </button>
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
  const [reviewCount, setReviewCount] = useState(0);

  // Badge: Anzahl der zur Prüfung offenen Rechnungen (Status "verarbeitet").
  useEffect(() => {
    flowcheckApi
      .invoices("status=verarbeitet")
      .then((r) => setReviewCount((r.items || []).filter((i) => i.status === "verarbeitet").length))
      .catch(() => setReviewCount(0));
  }, [pathname]);

  // Dynamischer Seitentitel.
  useEffect(() => {
    const segs = pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1] || "dashboard";
    const label = ROUTE_LABELS[last] || decodeURIComponent(last);
    document.title = `${label} — FlowCheck AI+`;
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Route-Progress-Bar oben */}
      <div key={pathname} className="fc-route-progress fixed left-0 top-0 z-[200] h-0.5 bg-[#003856]" />
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 md:block ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <SidebarPanel
          collapsed={collapsed}
          pathname={pathname}
          user={user}
          reviewCount={reviewCount}
          onLogout={logout}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <SidebarPanel
              collapsed={false}
              pathname={pathname}
              user={user}
              reviewCount={reviewCount}
              onLogout={logout}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className={`transition-[padding] duration-200 ${collapsed ? "md:pl-[76px]" : "md:pl-64"}`}>
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[rgba(0,56,86,0.08)] bg-[#f8f6f3]/85 px-4 backdrop-blur-xl md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#003856] hover:bg-[#003856]/5"
            aria-label="Menü öffnen"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-base font-semibold tracking-tight text-[#003856]">
            FlowCheck <span className="text-[#c8985a]">AI+</span>
          </span>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
