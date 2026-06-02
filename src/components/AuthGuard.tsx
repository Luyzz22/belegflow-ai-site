"use client";

import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/States";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa]">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-stone-500">Sitzung wird geprüft …</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // useAuth leitet bereits auf /login um; nichts rendern.
    return null;
  }

  return <>{children}</>;
}
