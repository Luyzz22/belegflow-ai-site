"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Zap,
  Upload,
  FileText,
  CheckCircle2,
  Building2,
  Landmark,
  ScrollText,
  Settings,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { flowcheckApi, type InvoiceListItem, type Lieferant } from "@/lib/api-client";

interface Cmd {
  id: string;
  group: string;
  label: string;
  sub?: string;
  icon: LucideIcon;
  run: () => void;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-stone-500">
      {children}
    </kbd>
  );
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Befehlspalette öffnen" },
  { keys: ["⌘", "U"], label: "Zum Upload" },
  { keys: ["⌘", "R"], label: "Review-Modus starten" },
  { keys: ["F"], label: "Review: Freigeben" },
  { keys: ["A"], label: "Review: Ablehnen" },
  { keys: ["→", "/", "J"], label: "Review: Nächste" },
  { keys: ["←", "/", "K"], label: "Review: Vorherige" },
  { keys: ["Esc"], label: "Schließen / Verlassen" },
];

export default function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [lieferanten, setLieferanten] = useState<Lieferant[]>([]);
  const loadedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  // Lazy-Load der durchsuchbaren Daten beim ersten Öffnen.
  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    flowcheckApi
      .invoices("limit=100&offset=0")
      .then((r) => setInvoices(r.items || []))
      .catch(() => setInvoices([]));
    flowcheckApi
      .lieferanten()
      .then((r) => setLieferanten(r.items || []))
      .catch(() => setLieferanten([]));
  }, [open]);

  // Fokus beim Öffnen.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Globale Shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (meta && k === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (meta && k === "u") {
        e.preventDefault();
        router.push("/upload");
      } else if (meta && k === "r") {
        e.preventDefault();
        router.push("/review");
      } else if (e.key === "Escape") {
        setOpen(false);
        setShowShortcuts(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const commands = useMemo<Cmd[]>(() => {
    const pages: Cmd[] = [
      { id: "p-dash", group: "Seiten", label: "Dashboard", icon: LayoutDashboard, run: () => go("/dashboard") },
      { id: "p-review", group: "Seiten", label: "Review", icon: Zap, run: () => go("/review") },
      { id: "p-upload", group: "Seiten", label: "Upload", icon: Upload, run: () => go("/upload") },
      { id: "p-inv", group: "Seiten", label: "Rechnungen", icon: FileText, run: () => go("/rechnungen") },
      { id: "p-frei", group: "Seiten", label: "Freigaben", icon: CheckCircle2, run: () => go("/freigaben") },
      { id: "p-lief", group: "Seiten", label: "Lieferanten", icon: Building2, run: () => go("/lieferanten") },
      { id: "p-exp", group: "Seiten", label: "DATEV-Export", icon: Landmark, run: () => go("/export") },
      { id: "p-audit", group: "Seiten", label: "Audit-Trail", icon: ScrollText, run: () => go("/audit") },
      { id: "p-set", group: "Seiten", label: "Einstellungen", icon: Settings, run: () => go("/einstellungen") },
    ];
    const actions: Cmd[] = [
      { id: "a-upload", group: "Aktionen", label: "Neue Rechnung hochladen", icon: Upload, run: () => go("/upload") },
      { id: "a-review", group: "Aktionen", label: "Review starten", icon: Zap, run: () => go("/review") },
      { id: "a-export", group: "Aktionen", label: "DATEV exportieren", icon: Landmark, run: () => go("/export") },
    ];
    const inv: Cmd[] = invoices.map((i) => ({
      id: `i-${i.id}`,
      group: "Rechnungen",
      label: i.lieferant || `Rechnung #${i.id}`,
      sub: i.rechnungsnummer,
      icon: FileText,
      run: () => go(`/rechnungen/${i.id}`),
    }));
    const lief: Cmd[] = lieferanten.map((l) => ({
      id: `l-${l.name}`,
      group: "Lieferanten",
      label: l.name,
      icon: Building2,
      run: () => go("/lieferanten"),
    }));
    return [...pages, ...actions, ...inv, ...lief];
  }, [invoices, lieferanten, go]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.filter((c) => c.group === "Seiten" || c.group === "Aktionen");
    return commands
      .filter((c) => `${c.label} ${c.sub ?? ""}`.toLowerCase().includes(q))
      .slice(0, 30);
  }, [commands, query]);

  // Gruppiert in Render-Reihenfolge.
  const groups = useMemo(() => {
    const order = ["Aktionen", "Seiten", "Rechnungen", "Lieferanten"];
    const map = new Map<string, Cmd[]>();
    filtered.forEach((c) => {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    });
    return order.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
  }, [filtered]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  return (
    <>
      {/* Shortcut-Hinweis-Button */}
      <button
        onClick={() => setShowShortcuts((s) => !s)}
        aria-label="Tastenkürzel anzeigen"
        className="fixed bottom-5 right-5 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(0,56,86,0.12)] bg-white text-sm font-semibold text-[#003856] shadow-md transition hover:bg-[#faf9f7]"
      >
        ?
      </button>

      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="fc-scale-in relative w-full max-w-md rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold text-[#1a1a2e]">Tastenkürzel</h2>
            <ul className="space-y-2.5">
              {SHORTCUTS.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-[#64748b]">{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Command Palette */}
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]" onClick={close}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          <div
            className="fc-scale-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[rgba(0,56,86,0.08)] px-4">
              <Search className="h-5 w-5 shrink-0 text-[#64748b]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onListKey}
                placeholder="Suchen oder Befehl eingeben …"
                className="w-full bg-transparent py-4 text-sm text-[#1a1a2e] outline-none placeholder:text-[#94a3b8]"
              />
              <Kbd>Esc</Kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-[#64748b]">Keine Treffer.</p>
              ) : (
                groups.map(({ group, items }) => (
                  <div key={group} className="mb-1">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                      {group}
                    </p>
                    {items.map((c) => {
                      const idx = filtered.indexOf(c);
                      const Icon = c.icon;
                      const isActive = idx === active;
                      return (
                        <button
                          key={c.id}
                          onMouseEnter={() => setActive(idx)}
                          onClick={c.run}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            isActive ? "bg-[#003856] text-white" : "text-[#1a1a2e] hover:bg-[#faf9f7]"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#64748b]"}`} />
                          <span className="flex-1 truncate">{c.label}</span>
                          {c.sub && (
                            <span className={`truncate text-xs ${isActive ? "text-white/70" : "text-[#94a3b8]"}`}>
                              {c.sub}
                            </span>
                          )}
                          {isActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-white/70" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
