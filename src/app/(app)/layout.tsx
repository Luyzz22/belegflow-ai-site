"use client";

import { AuthProvider } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import CommandMenu from "@/components/CommandMenu";
import CopilotWidget from "@/components/CopilotWidget";
import ProductTour from "@/components/ProductTour";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/toast/ToastProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <a
        href="#hauptinhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-xl focus:bg-[#003856] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Zum Hauptinhalt springen
      </a>
      <ToastProvider>
        <AuthProvider>
          <AuthGuard>
            <AppShell>{children}</AppShell>
            <CommandMenu />
            <CopilotWidget />
            <ProductTour />
          </AuthGuard>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
