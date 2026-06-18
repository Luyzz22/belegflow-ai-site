"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { CHANGELOG, LATEST_CHANGELOG_DATE } from "@/lib/changelog";

export default function ChangelogButton() {
  const [open, setOpen] = useState(false);
  const [unseen, setUnseen] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setUnseen(localStorage.getItem("fc_changelog_seen") !== LATEST_CHANGELOG_DATE));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const openPanel = () => {
    setOpen(true);
    localStorage.setItem("fc_changelog_seen", LATEST_CHANGELOG_DATE);
    setUnseen(false);
  };

  return (
    <>
      <button
        onClick={openPanel}
        title="Was gibt's Neues?"
        className="relative inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/90 transition hover:bg-white/20"
      >
        🆕 Neu
        {unseen && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ffb900]" aria-label="Neue Einträge" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[300] print:hidden" role="dialog" aria-modal="true" aria-label="Was gibt's Neues?">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fc-slide-in-right absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[rgba(0,56,86,0.08)] px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1a1a2e]">
                <Sparkles className="h-5 w-5 text-[#c8985a]" /> Was gibt&apos;s Neues?
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Schließen" className="rounded-lg p-1 text-[#64748b] transition hover:bg-[#faf9f7] hover:text-[#1a1a2e]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ol className="relative space-y-5 border-l border-[rgba(0,56,86,0.12)] pl-6">
                {CHANGELOG.map((c) => (
                  <li key={c.date} className="relative">
                    <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#003856] ring-4 ring-white" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">{c.date}</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#1a1a2e]">{c.title}</p>
                    <p className="mt-0.5 text-sm text-[#64748b]">{c.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
