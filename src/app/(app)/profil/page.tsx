"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import { LoadingState } from "@/components/States";

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

export default function ProfilPage() {
  const { user, logout } = useAuth();

  if (!user) return <LoadingState />;

  const initials = (user.name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="fc-fade-in">
      <PageHeader title="Profil" description="Ihre Kontodaten" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#003856] text-2xl font-semibold text-white">
              {initials}
            </div>
            <p className="mt-4 text-lg font-semibold text-[#1a1a2e]">{user.name || "—"}</p>
            <p className="text-sm text-[#64748b]">{user.email}</p>
            <span className="mt-3 rounded-lg bg-[#c8985a]/15 px-2.5 py-1 text-xs font-semibold text-[#8a6526]">
              {roleLabel(user.role)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)] lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Kontodetails</h2>
          <dl className="divide-y divide-[rgba(0,56,86,0.06)]">
            {[
              ["Name", user.name || "—"],
              ["E-Mail", user.email],
              ["Rolle", roleLabel(user.role)],
              ["Benutzer-ID", String(user.id)],
              ["Mandant", user.tenant_id || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3">
                <dt className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{label}</dt>
                <dd className="text-sm font-medium text-[#1a1a2e]">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 border-t border-[rgba(0,56,86,0.06)] pt-5">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 font-medium text-red-600 transition-all hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
