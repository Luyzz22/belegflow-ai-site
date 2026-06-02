import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von FlowCheck AI+ (SBS Deutschland GmbH & Co. KG).",
};

export default function ImpressumPage() {
  return (
    <PublicPage title="Impressum" narrow>
      <div className="space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200/60 text-sm leading-relaxed text-stone-600">
        <section>
          <h2 className="text-lg font-semibold text-[#003856]">Angaben gemäß § 5 DDG</h2>
          <p className="mt-2">
            SBS Deutschland GmbH &amp; Co. KG
            <br />
            Musterstraße 1
            <br />
            12345 Musterstadt
            <br />
            Deutschland
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#003856]">Vertretung</h2>
          <p className="mt-2">Vertretungsberechtigte Geschäftsführung: Geschäftsführer der Komplementär-GmbH</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#003856]">Kontakt</h2>
          <p className="mt-2">
            E-Mail:{" "}
            <a href="mailto:ki@sbsdeutschland.de" className="text-[#003856] hover:underline">
              ki@sbsdeutschland.de
            </a>
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#003856]">Registereintrag</h2>
          <p className="mt-2">
            Eingetragen im Handelsregister.
            <br />
            Registergericht: Amtsgericht Musterstadt
            <br />
            Registernummer: HRA 00000
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#003856]">Umsatzsteuer-ID</h2>
          <p className="mt-2">USt-IdNr. gemäß § 27a UStG: DE000000000</p>
        </section>
        <p className="border-t border-stone-100 pt-6 text-xs text-stone-400">
          Hinweis: Die hier hinterlegten Angaben sind Platzhalter und vor Veröffentlichung durch die rechtsverbindlichen
          Unternehmensdaten zu ersetzen.
        </p>
      </div>
    </PublicPage>
  );
}
