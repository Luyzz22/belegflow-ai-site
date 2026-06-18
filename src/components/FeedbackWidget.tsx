"use client";

import { useEffect, useState } from "react";
import { MessageSquarePlus, Star, X } from "lucide-react";
import { useToast } from "@/components/toast/ToastProvider";

export default function FeedbackWidget() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = () => {
    if (stars === 0) {
      addToast({ type: "error", text: "Bitte vergeben Sie eine Bewertung." });
      return;
    }
    const entry = { stars, text: text.trim(), email: email.trim(), timestamp: new Date().toISOString() };
    try {
      const list = JSON.parse(localStorage.getItem("fc_feedback") || "[]") as unknown[];
      list.push(entry);
      localStorage.setItem("fc_feedback", JSON.stringify(list));
    } catch {
      localStorage.setItem("fc_feedback", JSON.stringify([entry]));
    }
    addToast({ type: "success", text: "Danke für Ihr Feedback! 🙏" });
    setOpen(false);
    setStars(0);
    setText("");
    setEmail("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-[90] inline-flex items-center gap-2 rounded-full border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2.5 text-sm font-medium text-[#003856] shadow-[0_8px_30px_rgba(0,56,86,0.16)] transition hover:bg-[#faf9f7] active:scale-95 print:hidden"
        aria-label="Feedback geben"
      >
        <MessageSquarePlus className="h-4 w-4" />
        Feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-end justify-start bg-black/30 p-5 backdrop-blur-sm print:hidden sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Feedback-Formular"
          onClick={() => setOpen(false)}
        >
          <div className="fc-pop w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1a1a2e]">Wie gefällt Ihnen FlowCheck AI+?</h2>
              <button onClick={() => setOpen(false)} aria-label="Schließen" className="rounded-lg p-1 text-[#64748b] transition hover:bg-[#faf9f7] hover:text-[#1a1a2e]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-center gap-1.5 py-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setStars(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${n} Sterne`}
                  className="transition active:scale-90"
                >
                  <Star className={`h-8 w-8 ${(hover || stars) >= n ? "fill-[#FFB900] text-[#FFB900]" : "text-stone-300"}`} />
                </button>
              ))}
            </div>

            <label className="mt-3 block text-xs font-medium uppercase tracking-wider text-[#64748b]">Was können wir verbessern?</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Optional"
              className="mt-1.5 w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail für Rückfragen (optional)"
              className="mt-2 w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />

            <button
              onClick={submit}
              className="mt-4 w-full rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
            >
              Absenden
            </button>
          </div>
        </div>
      )}
    </>
  );
}
