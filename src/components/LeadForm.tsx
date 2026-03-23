"use client";

import { useMemo, useState } from "react";

type Reason = "demo" | "kontakt" | "unterlagen" | "api";

type LeadFormProps = {
  defaultReason?: Reason;
  title?: string;
  subtitle?: string;
};

const roleOptions = [
  "CFO / Finance-Leitung",
  "Buchhaltung / Accounting",
  "Steuerberater / Kanzlei",
  "IT / Engineering",
  "Datenschutz / Legal",
  "Einkauf / Procurement",
  "Geschäftsführung",
  "Sonstiges",
];

const companySizeOptions = ["1–10", "11–50", "51–250", "251–1000", "1000+"];
const volumeOptions = ["< 100", "100–500", "500–2.000", "2.000+", "noch unklar"];
const interestOptions = [
  "Demo für Finance",
  "Ablauf für Steuerberater & DATEV-Workflows",
  "Unterlagen für IT / Einkauf",
  "Technische/API-Rückfrage",
  "Allgemeines Produktgespräch",
];

export default function LeadForm({ defaultReason = "demo", title, subtitle }: LeadFormProps) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    business_email: "",
    role: roleOptions[0],
    company_size: companySizeOptions[1],
    monthly_invoice_volume: volumeOptions[1],
    interest: interestOptions[0],
    message: "",
    datev_context: false,
    erp_context: "",
    contact_reason: defaultReason as Reason,
    consent_contact: false,
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reasonOptions: Array<{ value: Reason; label: string }> = useMemo(
    () => [
      { value: "demo", label: "Demo anfragen" },
      { value: "kontakt", label: "Produktgespräch" },
      { value: "unterlagen", label: "Unterlagen für IT/Einkauf" },
      { value: "api", label: "Technische/API-Rückfrage" },
    ],
    [],
  );

  const update = (key: string, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-source-path": typeof window !== "undefined" ? window.location.pathname : "unknown",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Anfrage konnte nicht verarbeitet werden.");
      }

      setSuccess(`Vielen Dank. Ihre Anfrage wurde erfasst (ID: ${payload.lead_id}). Unser Team meldet sich per E-Mail.`);
      setForm((prev) => ({
        ...prev,
        name: "",
        company: "",
        business_email: "",
        message: "",
        erp_context: "",
        consent_contact: false,
        website: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#171717]/60 border border-[#262626] rounded-2xl p-6 sm:p-8">
      <h2 className="text-2xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{title || "Demo- und Kontaktanfrage"}</h2>
      <p className="text-sm text-[#a3a3a3] mb-6">{subtitle || "Wir nutzen Ihre Angaben ausschließlich zur Bearbeitung Ihrer geschäftlichen Anfrage. Keine Marketing-Einwilligung erforderlich (DSB prüfen)."}</p>

      {success && <p className="mb-4 text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg px-3 py-2">{success}</p>}
      {error && <p className="mb-4 text-sm bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-3 py-2">{error}</p>}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block mb-1 text-[#d4d4d4]">Name</span>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white" />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-[#d4d4d4]">Unternehmen</span>
            <input required value={form.company} onChange={(e) => update("company", e.target.value)} className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white" />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-[#d4d4d4]">Geschäftliche E-Mail</span>
            <input required type="email" value={form.business_email} onChange={(e) => update("business_email", e.target.value)} className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white" />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-[#d4d4d4]">Kontaktgrund</span>
            <select value={form.contact_reason} onChange={(e) => update("contact_reason", e.target.value)} className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white">
              {reasonOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-[#d4d4d4]">Rolle</span>
            <select value={form.role} onChange={(e) => update("role", e.target.value)} className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white">
              {roleOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-[#d4d4d4]">Unternehmensgröße</span>
            <select value={form.company_size} onChange={(e) => update("company_size", e.target.value)} className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white">
              {companySizeOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-[#d4d4d4]">Monatliches Rechnungsvolumen</span>
            <select value={form.monthly_invoice_volume} onChange={(e) => update("monthly_invoice_volume", e.target.value)} className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white">
              {volumeOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-[#d4d4d4]">Interesse</span>
            <select value={form.interest} onChange={(e) => update("interest", e.target.value)} className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white">
              {interestOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            <span className="block mb-1 text-[#d4d4d4]">ERP-/Prozesskontext (optional)</span>
            <input value={form.erp_context} onChange={(e) => update("erp_context", e.target.value)} placeholder="z. B. ERP-System, Freigabeprozess, DATEV-Workflow" className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#737373]" />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="block mb-1 text-[#d4d4d4]">Nachricht / Use Case</span>
            <textarea required rows={4} value={form.message} onChange={(e) => update("message", e.target.value)} className="w-full bg-[#0f0f0f] border border-[#404040] rounded-xl px-3 py-2.5 text-sm text-white" />
          </label>
        </div>

        <label className="flex items-start gap-2 text-sm text-[#a3a3a3]">
          <input type="checkbox" checked={form.datev_context} onChange={(e) => update("datev_context", e.target.checked)} className="mt-1" />
          <span>Unser Use Case hat Steuerberater-/DATEV-Bezug (optional).</span>
        </label>

        <label className="flex items-start gap-2 text-sm text-[#a3a3a3]">
          <input required type="checkbox" checked={form.consent_contact} onChange={(e) => update("consent_contact", e.target.checked)} className="mt-1" />
          <span>Ich stimme zu, dass meine Angaben zur Bearbeitung dieser geschäftlichen Anfrage verwendet werden. Weitere Infos in der <a className="text-[#e85d04] hover:text-[#f48c06]" href="/datenschutz">Datenschutzerklärung</a> (DSB prüfen).</span>
        </label>

        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />
          </label>
        </div>

        <button disabled={loading} className="w-full bg-[#e85d04] hover:bg-[#f48c06] disabled:opacity-60 rounded-xl py-3 text-sm font-semibold text-white transition">
          {loading ? "Wird verarbeitet..." : "Anfrage senden"}
        </button>
      </form>
    </div>
  );
}
