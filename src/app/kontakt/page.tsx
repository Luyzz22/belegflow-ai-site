"use client";
import { useState } from "react";
import Link from "next/link";

export default function KontaktPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "", type: "demo" });
  const [sent, setSent] = useState(false);
  const up = (k: string, v: string) => setForm({ ...form, [k]: v });

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, open mailto with prefilled data
    const subject = form.type === "demo" ? "Demo-Anfrage — BelegFlow AI" : "Kontaktanfrage — BelegFlow AI";
    const body = `Name: ${form.name}\nFirma: ${form.company}\nE-Mail: ${form.email}\n\n${form.message}`;
    window.open(`mailto:ki@sbsdeutschland.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
            <span className="text-lg font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
          <Link href="/register" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm font-medium text-white hover:bg-[#f48c06] transition">Kostenlos testen</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Kontakt & Demo</h1>
          <p className="text-[#a3a3a3]">Erfahren Sie, wie BelegFlow AI Ihre Rechnungsverarbeitung automatisiert.</p>
        </div>

        {sent ? (
          <div className="bg-[#171717]/50 border border-[#262626] rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-3">Vielen Dank!</h2>
            <p className="text-[#a3a3a3] mb-6">Ihre Anfrage wurde geöffnet. Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
            <Link href="/" className="inline-flex px-6 py-2.5 bg-[#e85d04] rounded-xl text-sm font-medium text-white hover:bg-[#f48c06] transition">Zurück zur Startseite</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <form onSubmit={handle} className="lg:col-span-3 bg-[#171717]/50 border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex gap-2 mb-2">
                {[{v:"demo",l:"Demo anfragen"},{v:"kontakt",l:"Allgemeine Anfrage"}].map(t=>(
                  <button key={t.v} type="button" onClick={()=>up("type",t.v)}
                    className={"px-4 py-2 rounded-lg text-sm font-medium transition "+(form.type===t.v?"bg-[#e85d04] text-white":"bg-[#262626] text-[#737373] hover:text-white")}>
                    {t.l}
                  </button>
                ))}
              </div>
              {[
                {k:"name",l:"Name",p:"Max Mustermann",t:"text",r:true},
                {k:"email",l:"E-Mail",p:"name@firma.de",t:"email",r:true},
                {k:"company",l:"Firma",p:"Muster GmbH",t:"text",r:false},
              ].map(f=>(
                <div key={f.k}>
                  <label className="block text-sm font-medium text-[#d4d4d4] mb-1.5">{f.l}</label>
                  <input type={f.t} value={(form as any)[f.k]} onChange={e=>up(f.k,e.target.value)} required={f.r} placeholder={f.p}
                    className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-4 py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#e85d04] transition"/>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[#d4d4d4] mb-1.5">Nachricht</label>
                <textarea value={form.message} onChange={e=>up("message",e.target.value)} rows={4}
                  placeholder={form.type==="demo"?"Erzählen Sie uns von Ihrem Rechnungsvolumen und aktuellen Prozessen...":"Wie können wir Ihnen helfen?"}
                  className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-4 py-3 text-sm text-white placeholder-[#525252] resize-none focus:outline-none focus:border-[#e85d04] transition"/>
              </div>
              <button type="submit" className="w-full bg-[#e85d04] hover:bg-[#f48c06] text-white font-semibold py-3 rounded-xl transition text-sm">
                {form.type==="demo"?"Demo anfragen":"Nachricht senden"}
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              {[
                {icon:"📧",title:"E-Mail",desc:"ki@sbsdeutschland.de",href:"mailto:ki@sbsdeutschland.de"},
                {icon:"🌐",title:"Website",desc:"sbsdeutschland.com",href:"https://sbsdeutschland.com"},
                {icon:"📍",title:"Standort",desc:"Heiligkreuzsteinach, BW",href:null},
                {icon:"⏱",title:"Antwortzeit",desc:"Innerhalb von 24h",href:null},
              ].map((c,i)=>(
                <div key={i} className="bg-[#171717]/50 border border-[#262626] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{c.icon}</span>
                    <div>
                      <p className="text-xs text-[#525252]">{c.title}</p>
                      {c.href ? <a href={c.href} className="text-sm text-[#e85d04] hover:text-[#f48c06]">{c.desc}</a> : <p className="text-sm text-[#d4d4d4]">{c.desc}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-gradient-to-br from-[#e85d04]/10 to-[#171717] border border-[#e85d04]/20 rounded-xl p-5 text-center">
                <p className="text-sm font-medium text-white mb-2">Lieber gleich loslegen?</p>
                <Link href="/register" className="inline-flex px-5 py-2 bg-[#e85d04] rounded-lg text-sm font-medium text-white hover:bg-[#f48c06] transition">Kostenlos registrieren</Link>
              </div>
              <div className="bg-[#171717]/50 border border-[#262626] rounded-xl p-4">
                <p className="text-xs text-[#525252] mb-2">Beschaffung & Prüfung</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["/sicherheit", "Sicherheit"],
                    ["/compliance", "Compliance"],
                    ["/avv", "AVV"],
                    ["/faq", "FAQ"],
                    ["/api-docs", "API"],
                  ].map(([href, label]) => (
                    <Link key={href} href={href} className="text-xs px-2.5 py-1 rounded-md border border-[#303030] text-[#a3a3a3] hover:text-white hover:border-[#e85d04]/60 transition">{label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
