"use client";

import { useAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import { LoadingState } from "@/components/States";

function roleLabel(role?: string) {
  const map: Record<string, string> = {
    admin: "Administrator",
    buchhalter: "Buchhaltung",
    freigeber: "Freigeber",
    viewer: "Leser",
  };
  return (role && map[role]) || role || "Benutzer";
}

export default function ProfilPage() {
  const { user, logout } = useAuth();

  if (!user) return <LoadingState />;

  return (
    <div className="fc-fade-in">
      <PageHeader title="Profil" description="Ihre Kontodaten" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#003856] text-2xl font-semibold text-white">
              {(user.name || "?").slice(0, 1).toUpperCase()}
            </div>
            <p className="mt-3 text-lg font-semibold text-stone-800">{user.name}</p>
            <p className="text-sm text-stone-500">{user.email}</p>
            <span className="mt-2 rounded-md bg-[#c8985a]/15 px-2 py-0.5 text-xs font-semibold text-[#8a6526]">
              {roleLabel(user.role)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/60 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-stone-800">Kontodetails</h2>
          <dl className="divide-y divide-stone-100">
            {[
              ["Name", user.name],
              ["E-Mail", user.email],
              ["Rolle", roleLabel(user.role)],
              ["Benutzer-ID", String(user.id)],
              ["Mandant", user.tenant_id || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3">
                <dt className="text-sm text-stone-500">{label}</dt>
                <dd className="text-sm font-medium text-stone-800">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 border-t border-stone-100 pt-5">
            <button
              onClick={logout}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
