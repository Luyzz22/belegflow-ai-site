"use client";

import { AuthProvider } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import CommandMenu from "@/components/CommandMenu";
import { ToastProvider } from "@/components/toast/ToastProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthGuard>
          <AppShell>{children}</AppShell>
          <CommandMenu />
        </AuthGuard>
      </AuthProvider>
    </ToastProvider>
  );
}
