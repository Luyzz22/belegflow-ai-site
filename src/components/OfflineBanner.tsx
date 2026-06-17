"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

// Zeigt einen Hinweis, wenn keine Internetverbindung besteht.
// Funktioniert ohne Service Worker — rein über den navigator.onLine-Status.
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    Promise.resolve().then(update);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[400] flex items-center justify-center gap-2 bg-[#003856] px-4 py-3 text-center text-sm font-medium text-white print:hidden">
      <WifiOff className="h-4 w-4 shrink-0" />
      FlowCheck AI+ — Keine Internetverbindung. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.
    </div>
  );
}
