"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Plus, Building2 } from "lucide-react";
import { getEntities, getActiveEntityId, setActiveEntityId, addEntity, type Entity } from "@/lib/entities";
import { useToast } from "@/components/toast/ToastProvider";

export default function EntitySwitcher() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [activeId, setActiveId] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Lazy aus localStorage nach Mount (vermeidet Hydration-Mismatch).
  useEffect(() => {
    Promise.resolve().then(() => {
      setEntities(getEntities());
      setActiveId(getActiveEntityId());
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const active = entities.find((e) => e.id === activeId);

  const select = (e: Entity) => {
    setActiveEntityId(e.id);
    setActiveId(e.id);
    setOpen(false);
    addToast({ type: "success", text: `Gewechselt zu ${e.name}` });
  };

  const create = () => {
    const name = newName.trim();
    if (!name) return;
    const e = addEntity(name);
    setEntities(getEntities());
    setNewName("");
    setAdding(false);
    select(e);
  };

  return (
    <div ref={ref} className="relative px-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-white/90 transition hover:bg-white/5"
      >
        <Building2 className="h-4 w-4 shrink-0 text-white/60" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium">{active?.name ?? "Unternehmen"}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 z-50 mt-1 overflow-hidden rounded-xl border border-[rgba(0,56,86,0.08)] bg-white py-1 shadow-xl">
          {entities.map((e) => (
            <button
              key={e.id}
              onClick={() => select(e)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1a1a2e] transition hover:bg-[#faf9f7]"
            >
              <span className="min-w-0 flex-1 truncate">{e.name}</span>
              {e.id === activeId && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
            </button>
          ))}
          <div className="my-1 border-t border-[rgba(0,56,86,0.06)]" />
          {adding ? (
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <input
                value={newName}
                autoFocus
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                placeholder="Firmenname"
                className="min-w-0 flex-1 rounded-lg border border-[rgba(0,56,86,0.12)] px-2 py-1.5 text-sm outline-none focus:border-[#003856]"
              />
              <button onClick={create} className="rounded-lg bg-[#003856] px-2.5 py-1.5 text-xs font-medium text-white">OK</button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7]"
            >
              <Plus className="h-4 w-4" /> Unternehmen hinzufügen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
