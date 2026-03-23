"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

const API = "https://app.sbsdeutschland.com/api/erechnung";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
  sources?: { invoices_analyzed: number; events_analyzed: number; kontierungen_analyzed: number };
  suggestions?: string[];
}

export default function CopilotPage() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Willkommen beim **BelegFlow Finance Copilot**. Ich habe Zugriff auf Ihren Rechnungseingang, KI-Kontierungen und DATEV-Exporte. Wie kann ich helfen?",
    suggestions: ["\u00dcberblick \u00fcber meinen Rechnungseingang", "Wie verteilen sich die KI-Kontierungen?", "Gibt es offene Freigaben?"],
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setMessages(p => [...p, { role: "user", content: q }]);
    setInput(""); setLoading(true);
    try {
      const history = messages.filter(m => m.role === "user" || m.role === "assistant").slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(API + "/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token },
        body: JSON.stringify({ question: q, conversation_history: history }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const d = await res.json();
      setMessages(p => [...p, { role: "assistant", content: d.answer, model: d.model, sources: d.sources, suggestions: d.suggested_questions }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Verbindungsfehler zum Finance Copilot. Bitte versuchen Sie es erneut." }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const renderMd = (t: string) => t
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-[#262626] rounded text-[#f48c06] text-sm">$1</code>')
    .replace(/\n/g, "<br/>");

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-900">
      <div className="border-b border-white/[0.06] bg-[#f4f7fa]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</a>
            <div className="h-6 w-px bg-[#262626]" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-lg">🤖</div>
              <div><h1 className="text-lg font-semibold">Finance Copilot</h1><p className="text-xs text-gray-500">KI-Finanzassistent</p></div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">● Live</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-36">
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-900">
          Transparenz-Hinweis: Antworten werden KI-gestützt erzeugt und können unvollständig sein. Keine Rechts- oder Steuerberatung; Ergebnisse bitte fachlich prüfen (juristisch prüfen / steuerlich validieren).
        </div>
        <div className="py-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={"flex " + (msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={"max-w-[85%] rounded-2xl px-5 py-4 " + (msg.role === "user"
                ? "bg-[#e85d04]/20 border border-[#e85d04]/30 text-gray-700"
                : "bg-white/80 border border-gray-200 text-gray-700")}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                    <span className="text-xs text-gray-400 font-medium">Finance Copilot</span>
                    {msg.model && <span className="text-xs px-2 py-0.5 rounded-full bg-[#262626] text-gray-500">{msg.model}</span>}
                  </div>
                )}
                <div className="leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }} />
                {msg.sources && (
                  <div className="mt-3 pt-2 border-t border-gray-200 flex gap-3 flex-wrap">
                    <span className="text-xs text-gray-400">📊 {msg.sources.invoices_analyzed} Rechnungen</span>
                    <span className="text-xs text-gray-400">📋 {msg.sources.events_analyzed} Events</span>
                    <span className="text-xs text-gray-400">🤖 {msg.sources.kontierungen_analyzed} Kontierungen</span>
                  </div>
                )}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-200 flex flex-col gap-2">
                    {msg.suggestions.map((s, j) => (
                      <button key={j} onClick={() => send(s)}
                        className="text-left text-xs text-[#e85d04] hover:text-[#f48c06] hover:bg-[#262626]/50 px-3 py-2 rounded-lg transition">
                        → {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/80 border border-gray-200 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-gray-400 ml-2">analysiert Daten...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#f4f7fa]/95 backdrop-blur-xl border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Frage zu Rechnungen, Kontierungen, DATEV..." rows={1}
              className="flex-1 bg-white border border-[#404040] rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-[#525252] resize-none focus:outline-none focus:border-[#e85d04] transition" />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="px-5 py-3 bg-[#e85d04] hover:bg-[#f48c06] rounded-xl text-sm font-medium disabled:opacity-40 transition">
              {loading ? "..." : "Senden"}
            </button>
          </div>
          <p className="text-center text-xs text-[#404040] mt-2">Antworten basieren auf Echtzeitdaten und KI-Modellen · Gemini 2.0 Flash + Claude Sonnet</p>
        </div>
      </div>
    </div>
  );
}
