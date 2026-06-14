"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/** Hell/Dunkel-Umschalter (persistiert in localStorage: fc_theme). */
export default function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    Promise.resolve().then(() => setDark(isDark));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("fc_theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren"}
      title={dark ? "Heller Modus" : "Dunkler Modus"}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/65 transition hover:bg-white/5 hover:text-white ${
        collapsed ? "justify-center" : ""
      }`}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!collapsed && (dark ? "Heller Modus" : "Dunkler Modus")}
    </button>
  );
}
