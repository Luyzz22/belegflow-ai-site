"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Sparkles, Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { dateDE } from "@/lib/format";

interface Comment {
  text: string;
  author: string;
  timestamp: string;
}

function loadComments(id: number): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(`fc_comments_${id}`) || "[]") as Comment[];
  } catch {
    return [];
  }
}

// Minimales Markdown (fett, kursiv) als React-Elemente — KEIN dangerouslySetInnerHTML.
// React escaped Textknoten automatisch, daher XSS-sicher ohne manuelles Sanitizing.
function renderInline(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > last) nodes.push(line.slice(last, m.index));
    if (m[1] !== undefined) nodes.push(<strong key={key++}>{m[1]}</strong>);
    else nodes.push(<em key={key++}>{m[2]}</em>);
    last = m.index + m[0].length;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes;
}

function CommentBody({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const content = line.startsWith("- ") ? `• ${line.slice(2)}` : line;
        return (
          <Fragment key={i}>
            {i > 0 && <br />}
            {renderInline(content)}
          </Fragment>
        );
      })}
    </>
  );
}

export default function InvoiceComments({ invoiceId, summary }: { invoiceId: number; summary: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    const list = loadComments(invoiceId);
    Promise.resolve().then(() => setComments(list));
  }, [invoiceId]);

  const persist = (list: Comment[]) => {
    setComments(list);
    if (typeof window !== "undefined") localStorage.setItem(`fc_comments_${invoiceId}`, JSON.stringify(list));
  };

  const post = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    persist([...comments, { text: text.trim(), author: user?.name || user?.email || "Sie", timestamp: new Date().toISOString() }]);
    setText("");
  };

  const saveSummaryAsComment = () => {
    if (!aiSummary) return;
    persist([...comments, { text: aiSummary, author: "KI-Zusammenfassung", timestamp: new Date().toISOString() }]);
    setAiSummary(null);
  };

  const initials = (a: string) => a.slice(0, 1).toUpperCase();

  return (
    <div className="mt-6 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[#1a1a2e]">
          <MessageSquare className="h-5 w-5 text-[#003856]" /> Notizen &amp; Kommentare
        </h2>
        <button
          onClick={() => setAiSummary(summary)}
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-[#c8985a]" /> KI-Zusammenfassung
        </button>
      </div>

      {aiSummary && (
        <div className="mb-4 rounded-xl border border-[#c8985a]/30 bg-[#c8985a]/10 p-4">
          <p className="text-sm leading-relaxed text-[#1a1a2e]">{aiSummary}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={saveSummaryAsComment} className="rounded-lg bg-[#003856] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#002a42] active:scale-95">
              Als Kommentar speichern
            </button>
            <button onClick={() => setAiSummary(null)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#64748b] transition hover:bg-[#faf9f7]">
              Verwerfen
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {comments.length > 0 && (
        <ul className="mb-4 space-y-3">
          {comments.map((c, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#003856] text-xs font-semibold text-white">
                {initials(c.author)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1a1a2e]">{c.author}</span>
                  <span className="text-xs text-[#94a3b8]">{dateDE(c.timestamp, true)}</span>
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-[#64748b]"><CommentBody text={c.text} /></p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Eingabe */}
      <form onSubmit={post} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Kommentar … (Markdown: **fett**, *kursiv*, - Liste)"
          className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Kommentieren
          </button>
        </div>
      </form>
    </div>
  );
}
