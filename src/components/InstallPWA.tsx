"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Zeigt nur dann einen Installations-Hinweis, wenn der Browser eine
// PWA-Installation anbietet (beforeinstallprompt). Kein Auto-Popup.
export default function InstallPWA({ collapsed }: { collapsed?: boolean }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred) return null;

  const install = async () => {
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
  };

  return (
    <button
      onClick={install}
      title="Als App installieren"
      className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white ${
        collapsed ? "px-0" : ""
      }`}
    >
      <Smartphone className="h-4 w-4" />
      {!collapsed && "📱 Als App installieren"}
    </button>
  );
}
