"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { flowcheckApi, type InvoiceDetail } from "@/lib/api-client";
import { eur, dateDE, pct } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState, ErrorState } from "@/components/States";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 py-2.5 last:border-0">
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="text-sm font-medium text-stone-800">{value || "—"}</dd>
    </div>
  );
}

function ValidIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">✓ Gültig</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-rose-600">✕ Ungültig</span>
  );
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const invalidId = !id || Number.isNaN(id);
  const [inv, setInv] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    flowcheckApi
      .invoice(id)
      .then((d) => {
        setInv(d);
        setError(null);
      })
      .catch((e) => setError(e?.message || "Rechnung konnte nicht geladen werden"))
      .finally(() => setLoading(false));
  }, [id]);

  const retry = () => {
    setLoading(true);
    setError(null);
    load();
  };

  useEffect(() => {
    if (invalidId) return;
    load();
  }, [invalidId, load]);

  if (invalidId)
    return (
      <>
        <button onClick={() => router.back()} className="mb-4 text-sm text-stone-500 hover:text-[#003856]">
          ← Zurück
        </button>
        <ErrorState message="Ungültige Rechnungs-ID" />
      </>
    );
  if (loading) return <LoadingState label="Rechnung wird geladen …" />;
  if (error || !inv)
    return (
      <>
        <button onClick={() => router.back()} className="mb-4 text-sm text-stone-500 hover:text-[#003856]">
          ← Zurück
        </button>
        <ErrorState message={error || "Rechnung nicht gefunden"} onRetry={retry} />
      </>
    );

  const pflicht = inv.validierung?.pflichtangaben ?? [];

  return (
    <div className="fc-fade-in">
      <Link href="/rechnungen" className="mb-4 inline-block text-sm text-stone-500 hover:text-[#003856]">
        ← Alle Rechnungen
      </Link>
      <PageHeader
        title={inv.lieferant || "Rechnung"}
        description={`Rechnung ${inv.rechnungsnummer || "—"} · ${dateDE(inv.datum)}`}
        action={<StatusBadge status={inv.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Hauptdaten */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="mb-3 text-sm font-semibold text-stone-800">Extrahierte Felder</h2>
            <dl>
              <Field label="Lieferant" value={inv.lieferant} />
              <Field label="Rechnungsnummer" value={inv.rechnungsnummer} />
              <Field label="Rechnungsdatum" value={dateDE(inv.datum)} />
              <Field label="USt-IdNr." value={inv.ust_id} />
              <Field label="IBAN" value={inv.iban} />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="mb-3 text-sm font-semibold text-stone-800">Beträge</h2>
            <dl>
              <Field label="Nettobetrag" value={eur(inv.netto, inv.waehrung)} />
              <Field label={`Umsatzsteuer (${inv.ust_satz ?? 0}%)`} value={eur(inv.ust_betrag, inv.waehrung)} />
              <div className="flex items-center justify-between border-t-2 border-stone-100 pt-3">
                <dt className="text-sm font-semibold text-stone-700">Gesamtbetrag</dt>
                <dd className="text-lg font-semibold text-[#003856]">{eur(inv.betrag, inv.waehrung)}</dd>
              </div>
            </dl>
          </section>

          {/* Kontierung */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="mb-3 text-sm font-semibold text-stone-800">Kontierung</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ["Konto", inv.kontierung?.konto],
                ["Gegenkonto", inv.kontierung?.gegenkonto],
                ["Steuerschlüssel", inv.kontierung?.steuerschluessel],
              ].map(([label, val]) => (
                <div key={label as string} className="rounded-xl bg-[#f4f7fa] p-4">
                  <p className="text-xs uppercase tracking-wide text-stone-400">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-[#003856]">{val || "—"}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Validierung + Anomalien */}
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="mb-3 text-sm font-semibold text-stone-800">Validierung</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">IBAN</span>
                <ValidIcon ok={!!inv.validierung?.iban_valid} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">USt-IdNr.</span>
                <ValidIcon ok={!!inv.validierung?.ustid_valid} />
              </div>
            </div>
            {pflicht.length > 0 && (
              <div className="mt-4 border-t border-stone-100 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  §14 UStG Pflichtangaben
                </p>
                <ul className="space-y-1.5">
                  {pflicht.map((p, i) => {
                    const ok = typeof p === "string" ? true : !!p.vorhanden;
                    const label = typeof p === "string" ? p : p.feld;
                    return (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className={ok ? "text-emerald-600" : "text-rose-500"}>{ok ? "✓" : "✕"}</span>
                        <span className="text-stone-600">{label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="mb-3 text-sm font-semibold text-stone-800">Anomalien</h2>
            {!inv.anomalien || inv.anomalien.length === 0 ? (
              <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                ✓ Keine Auffälligkeiten erkannt
              </p>
            ) : (
              <ul className="space-y-2">
                {inv.anomalien.map((a, i) => {
                  const text = typeof a === "string" ? a : a.beschreibung || a.typ || "Anomalie";
                  return (
                    <li key={i} className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100">
                      ⚠️ {text}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/60">
            <h2 className="mb-2 text-sm font-semibold text-stone-800">Metadaten</h2>
            <dl>
              <Field label="Erfasst am" value={dateDE(inv.created_at, true)} />
              <Field label="USt-Satz" value={pct(inv.ust_satz)} />
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
