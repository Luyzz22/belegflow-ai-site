"use client";
import { useAuth } from "@/lib/useAuth";

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center px-6">
        <div className="max-w-lg bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h1 className="text-base font-semibold text-amber-900">Keine Berechtigung</h1>
          <p className="text-sm text-amber-800 mt-2">
            Dieser Bereich ist für Ihre aktuelle Rolle nicht freigeschaltet. Bitte Rechte im Team abstimmen.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
