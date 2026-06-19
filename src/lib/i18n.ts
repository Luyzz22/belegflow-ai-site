"use client";

import { useEffect, useState } from "react";

export type Lang = "de" | "en";

const translations: Record<Lang, Record<string, string>> = {
  de: {
    "nav.dashboard": "Dashboard",
    "nav.upload": "Upload",
    "nav.review": "Review",
    "nav.rechnungen": "Rechnungen",
    "nav.freigaben": "Freigaben",
    "nav.lieferanten": "Lieferanten",
    "nav.export": "DATEV-Export",
    "nav.zahlungen": "Zahlungen",
    "nav.abgleich": "Abgleich",
    "nav.audit": "Audit-Trail",
    "nav.aktivitaet": "Aktivität",
    "nav.analytics": "Analytics",
    "nav.prozesse": "Prozesse",
    "nav.cashflow": "Cash Flow",
    "nav.roi": "ROI",
    "nav.compliance-center": "Compliance",
    "nav.einstellungen": "Einstellungen",
    "nav.entwickler": "Entwickler",
    "nav.hilfe": "Hilfe",
    "kpi.invoicesThisMonth": "Rechnungen diesen Monat",
    "kpi.automationRate": "Automatisierungsquote",
    "kpi.openApprovals": "Offene Freigaben",
    "kpi.anomalyAlerts": "Anomalie-Alerts",
    "cta.tryFree": "Kostenlos testen",
  },
  en: {
    "nav.dashboard": "Dashboard",
    "nav.upload": "Upload",
    "nav.review": "Review",
    "nav.rechnungen": "Invoices",
    "nav.freigaben": "Approvals",
    "nav.lieferanten": "Suppliers",
    "nav.export": "DATEV Export",
    "nav.zahlungen": "Payments",
    "nav.abgleich": "Reconciliation",
    "nav.audit": "Audit Trail",
    "nav.aktivitaet": "Activity",
    "nav.analytics": "Analytics",
    "nav.prozesse": "Processes",
    "nav.cashflow": "Cash Flow",
    "nav.roi": "ROI",
    "nav.compliance-center": "Compliance",
    "nav.einstellungen": "Settings",
    "nav.entwickler": "Developer",
    "nav.hilfe": "Help",
    "kpi.invoicesThisMonth": "Invoices this month",
    "kpi.automationRate": "Automation rate",
    "kpi.openApprovals": "Open approvals",
    "kpi.anomalyAlerts": "Anomaly alerts",
    "cta.tryFree": "Try for free",
  },
};

const KEY = "fc_lang";
const EVENT = "fc-lang-change";

export function getLang(): Lang {
  if (typeof window === "undefined") return "de";
  return localStorage.getItem(KEY) === "en" ? "en" : "de";
}

export function setLang(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, lang);
  window.dispatchEvent(new Event(EVENT));
}

export function translate(lang: Lang, key: string): string {
  return translations[lang][key] ?? translations.de[key] ?? key;
}

/** Reaktiver Übersetzungs-Hook. Standard: Deutsch. */
export function useTranslation() {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    Promise.resolve().then(() => setLangState(getLang()));
    const handler = () => setLangState(getLang());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    lang,
    setLang,
    t: (key: string) => translate(lang, key),
  };
}
