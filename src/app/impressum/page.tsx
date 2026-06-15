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
            In der Dell 19
            <br />
            69469 Weinheim
            <br />
            Deutschland
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#003856]">Vertretung</h2>
          <p className="mt-2">Geschäftsführer: Andreas Schenk</p>
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
            Registergericht: Amtsgericht Mannheim
            <br />
            Registernummer: HRA 706204
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#003856]">Umsatzsteuer-Identifikationsnummer</h2>
          <p className="mt-2">USt-IdNr. gemäß § 27a UStG: DE345927327</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#003856]">Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV</h2>
          <p className="mt-2">
            Luis Schenk
            <br />
            In der Dell 19, 69469 Weinheim
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#003856]">Verbraucherstreitbeilegung</h2>
          <p className="mt-2">
            Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
          </p>
        </section>
      </div>
    </PublicPage>
  );
}
