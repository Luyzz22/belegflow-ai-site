"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLink } from "@/components/Brand";

const LINKS: [string, string][] = [
  ["/preise", "Preise"],
  ["/trust", "Trust Center"],
  ["/compliance", "Compliance"],
  ["/kontakt", "Kontakt"],
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(0,56,86,0.08)] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <BrandLink />
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map(([h, l]) => (
            <Link
              key={h}
              href={h}
              className="text-sm font-medium text-[#64748b] transition-all hover:text-[#003856]"
            >
              {l}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-[#003856] transition-all hover:bg-[#003856]/5"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#FFB900] px-4 py-2.5 text-sm font-semibold text-[#003856] transition-all hover:bg-[#e6a800]"
          >
            Kostenlos testen
          </Link>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#003856] transition-all hover:bg-[#003856]/5 md:hidden"
          aria-label="Menü"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-[rgba(0,56,86,0.08)] bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map(([h, l]) => (
              <Link
                key={h}
                href={h}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#1a1a2e] transition-all hover:bg-[#003856]/5"
              >
                {l}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-[#003856]/20 px-4 py-2.5 text-center text-sm font-medium text-[#003856]"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-[#FFB900] px-4 py-2.5 text-center text-sm font-semibold text-[#003856]"
              >
                Testen
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
