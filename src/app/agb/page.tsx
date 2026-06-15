import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen für die Nutzung von FlowCheck AI+.",
};

const H2 = "mt-7 text-base font-semibold text-[#003856]";
const P = "mt-2";

export default function AgbPage() {
  return (
    <PublicPage title="Allgemeine Geschäftsbedingungen" narrow>
      <div className="rounded-2xl bg-white p-8 text-sm leading-relaxed text-stone-600 shadow-sm ring-1 ring-stone-200/60">
        <p className="text-xs text-stone-400">Stand: Juni 2026</p>

        <h2 className="mt-4 text-base font-semibold text-[#003856]">§ 1 Geltungsbereich</h2>
        <p className={P}>
          Diese AGB gelten für alle Verträge zwischen der SBS Deutschland GmbH &amp; Co. KG („Anbieter“) und ihren
          Kunden über die Nutzung der Software „FlowCheck AI+“. Abweichende Bedingungen des Kunden gelten nur bei
          ausdrücklicher schriftlicher Zustimmung.
        </p>

        <h2 className={H2}>§ 2 Vertragsgegenstand</h2>
        <p className={P}>
          Gegenstand ist die Bereitstellung von FlowCheck AI+ als Software-as-a-Service (SaaS) zur automatisierten
          Verarbeitung von Eingangsrechnungen einschließlich KI-gestützter Extraktion, Validierung, Freigabe und
          DATEV-Export.
        </p>

        <h2 className={H2}>§ 3 Registrierung und Account</h2>
        <p className={P}>
          Die Nutzung setzt ein Benutzerkonto voraus. Der Kunde ist für die Geheimhaltung seiner Zugangsdaten
          verantwortlich und verpflichtet, Angaben aktuell zu halten.
        </p>

        <h2 className={H2}>§ 4 Leistungsbeschreibung</h2>
        <p className={P}>
          Der Funktionsumfang richtet sich nach dem gebuchten Tarif. Der Anbieter darf die Software weiterentwickeln,
          sofern der vereinbarte Leistungskern erhalten bleibt.
        </p>

        <h2 className={H2}>§ 5 Vergütung und Zahlung</h2>
        <p className={P}>
          Die Vergütung richtet sich nach dem gewählten Tarif und ist monatlich im Voraus fällig. Die Abrechnung
          erfolgt über den Zahlungsdienstleister Stripe.
        </p>

        <h2 className={H2}>§ 6 Verfügbarkeit</h2>
        <p className={P}>
          Der Anbieter strebt eine Verfügbarkeit von 99,5 % im Jahresmittel an. Hiervon ausgenommen sind angekündigte
          Wartungsfenster und Störungen außerhalb des Einflussbereichs des Anbieters.
        </p>

        <h2 className={H2}>§ 7 Datenschutz</h2>
        <p className={P}>
          Es gelten die <a href="/datenschutz" className="text-[#003856] hover:underline">Datenschutzerklärung</a> und
          die <a href="/avv" className="text-[#003856] hover:underline">Auftragsverarbeitungsvereinbarung</a> nach
          Art. 28 DSGVO.
        </p>

        <h2 className={H2}>§ 8 KI-Transparenz</h2>
        <p className={P}>
          FlowCheck AI+ kennzeichnet KI-generierte Inhalte gemäß Art. 50 EU AI Act. Freigaben erfolgen ausschließlich
          durch den Kunden (Human-in-the-Loop); es werden keine automatisierten Einzelentscheidungen mit rechtlicher
          Wirkung getroffen.
        </p>

        <h2 className={H2}>§ 9 Haftung</h2>
        <p className={P}>
          Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie nach dem Produkthaftungsgesetz.
          Bei einfacher Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten und
          begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
        </p>

        <h2 className={H2}>§ 10 Laufzeit und Kündigung</h2>
        <p className={P}>
          Verträge sind monatlich kündbar zum Ende des jeweiligen Abrechnungszeitraums. Das Recht zur außerordentlichen
          Kündigung aus wichtigem Grund bleibt unberührt.
        </p>

        <h2 className={H2}>§ 11 Schlussbestimmungen</h2>
        <p className={P}>
          Es gilt deutsches Recht. Sollte eine Bestimmung unwirksam sein, bleibt die Wirksamkeit der übrigen
          Bestimmungen unberührt.
        </p>
      </div>
    </PublicPage>
  );
}
