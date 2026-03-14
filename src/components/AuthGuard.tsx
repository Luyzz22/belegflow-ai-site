"use client";
import { useAuth } from "@/lib/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || !user) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
  return <>{children}</>;
}
