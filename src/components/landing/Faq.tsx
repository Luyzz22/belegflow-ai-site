"use client";

import { ChevronDown } from "lucide-react";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Welche Formate werden unterstützt?",
    a: "PDF, Scans (JPEG, PNG) sowie elektronische Rechnungen im XRechnung- und ZUGFeRD-Format. Stapel-Uploads mit mehreren Dateien sind möglich.",
  },
  {
    q: "Ist FlowCheck AI+ DSGVO-konform?",
    a: "Ja. Alle Daten werden ausschließlich in deutschen Rechenzentren verarbeitet und gespeichert. Einen Auftragsverarbeitungsvertrag (AVV) stellen wir bereit.",
  },
  {
    q: "Was bedeutet GoBD-ready?",
    a: "Belege und Verarbeitungsschritte werden revisionssicher und unveränderbar protokolliert — inklusive lückenlosem Audit-Trail, wie es die GoBD verlangen.",
  },
  {
    q: "Wie funktioniert der DATEV-Export?",
    a: "FlowCheck AI+ erzeugt aus den geprüften Rechnungen fertige Buchungssätze und exportiert sie als DATEV-kompatible CSV-Datei für Ihre Steuerkanzlei.",
  },
  {
    q: "Wie lange dauert das Onboarding?",
    a: "In der Regel unter einem Tag. Konto anlegen, erste Rechnungen hochladen, Freigabe-Regeln festlegen — fertig. Keine Setup-Kosten.",
  },
  {
    q: "Was prüft die KI genau?",
    a: "Pflichtangaben nach §14 UStG, Gültigkeit von IBAN und USt-ID, Dublettenprüfung sowie statistische Anomalien wie ungewöhnliche Beträge oder neue Lieferanten.",
  },
  {
    q: "Kann ich jederzeit kündigen?",
    a: "Ja, alle Tarife sind monatlich kündbar. Keine Mindestlaufzeit, keine versteckten Gebühren.",
  },
  {
    q: "Wo werden meine Daten gespeichert?",
    a: "Ausschließlich in deutschen Rechenzentren (Hosting in Deutschland). Ihre Daten verlassen den deutschen Rechtsraum nicht.",
  },
  {
    q: "Gibt es eine API?",
    a: "Ja, im Business-Plan steht eine REST-API für die Integration in Ihre bestehenden Systeme zur Verfügung.",
  },
  {
    q: "Was passiert mit der E-Rechnungspflicht 2025–2028?",
    a: "FlowCheck AI+ verarbeitet bereits heute XRechnung und ZUGFeRD und ist auf die schrittweise E-Rechnungspflicht ab 2025 vorbereitet — Sie sind rechtzeitig gerüstet.",
  },
];

export default function Faq() {
  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-3">
      {FAQS.map(({ q, a }) => (
        <details
          key={q}
          className="group rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium text-[#1a1a2e]">
            {q}
            <ChevronDown className="h-5 w-5 shrink-0 text-[#64748b] transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-[#64748b]">{a}</p>
        </details>
      ))}
    </div>
  );
}
