"use client";
import AuthGuard from "@/components/AuthGuard";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f4f7fa]">
        <DashboardHeader />
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
