"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Info, AlertTriangle, XCircle, X, Undo2, type LucideIcon } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastInput {
  type: ToastType;
  text: string;
  duration?: number; // ms, default 5000
  undo?: { onUndo: () => void; label?: string };
}

interface ToastItem extends ToastInput {
  id: number;
}

interface ToastCtx {
  addToast: (t: ToastInput) => number;
  removeToast: (id: number) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const META: Record<ToastType, { icon: LucideIcon; ring: string; text: string; iconCls: string }> = {
  success: { icon: CheckCircle2, ring: "border-emerald-200", text: "text-emerald-700", iconCls: "text-emerald-600" },
  info: { icon: Info, ring: "border-blue-200", text: "text-blue-700", iconCls: "text-blue-600" },
  warning: { icon: AlertTriangle, ring: "border-amber-200", text: "text-amber-700", iconCls: "text-amber-600" },
  error: { icon: XCircle, ring: "border-red-200", text: "text-red-700", iconCls: "text-red-600" },
};

const MAX = 3;

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const meta = META[item.type];
  const Icon = meta.icon;
  useEffect(() => {
    const t = setTimeout(onClose, item.duration ?? 5000);
    return () => clearTimeout(t);
  }, [item.duration, onClose]);

  return (
    <div
      role="status"
      className={`fc-toast flex w-80 items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-[0_8px_30px_rgba(0,56,86,0.16)] ${meta.ring}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.iconCls}`} />
      <p className="flex-1 text-sm font-medium text-[#1a1a2e]">{item.text}</p>
      {item.undo && (
        <button
          onClick={() => {
            item.undo?.onUndo();
            onClose();
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold text-[#003856] transition hover:bg-[#003856]/5"
        >
          <Undo2 className="h-3.5 w-3.5" />
          {item.undo.label ?? "Rückgängig"}
        </button>
      )}
      <button
        onClick={onClose}
        aria-label="Schließen"
        className="shrink-0 rounded-lg p-0.5 text-[#64748b] transition hover:bg-[#faf9f7] hover:text-[#1a1a2e]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const removeToast = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((t: ToastInput) => {
    const id = nextId.current++;
    setItems((prev) => [...prev, { ...t, id }].slice(-MAX));
    return id;
  }, []);

  return (
    <Ctx.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastCard item={item} onClose={() => removeToast(item.id)} />
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast muss innerhalb von <ToastProvider> verwendet werden");
  return ctx;
}
