"use client";

import { User } from "@/lib/useAuth";

type RoleGateProps = {
  user: User;
  allowedRoles: string[];
  areaLabel: string;
  children: React.ReactNode;
};

export default function RoleGate({ user, allowedRoles, areaLabel, children }: RoleGateProps) {
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h1 className="text-base font-semibold text-amber-900">Zugriff eingeschränkt</h1>
        <p className="text-sm text-amber-800 mt-2">
          Für den Bereich „{areaLabel}“ fehlen Ihnen die erforderlichen Rechte.
          Bitte eine Admin-Rolle zuweisen lassen oder den Vorgang im Team klären.
        </p>
      </div>
    </div>
  );
}
