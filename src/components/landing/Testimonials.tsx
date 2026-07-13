import Link from "next/link";
import { Rocket, ArrowRight, Handshake, MessagesSquare, BadgePercent } from "lucide-react";

// Statt erfundener Testimonials/Kundenlogos (UWG-Risiko in der Pilotphase):
// ehrliche Einladung, Design-Partner zu werden.

const BENEFITS = [
  { icon: MessagesSquare, title: "Direkter Draht", desc: "Feedback fließt unmittelbar in die Roadmap — Sie gestalten das Produkt mit." },
  { icon: BadgePercent, title: "Pilot-Konditionen", desc: "Bevorzugte Konditionen und früher Zugang zu neuen Funktionen." },
  { icon: Handshake, title: "Partnerschaft", desc: "Gemeinsame Einführung mit persönlicher Begleitung durch das Team." },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="overflow-hidden rounded-3xl border border-[rgba(0,56,86,0.08)] bg-[#003856] px-6 py-14 text-white sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#FFB900]">
            <Rocket className="h-3.5 w-3.5" /> Pilotphase
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Werden Sie Design-Partner</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/75">
            FlowCheck AI+ ist frisch am Start. Wir suchen Unternehmen aus dem Mittelstand, die ihre
            Eingangsrechnungs­verarbeitung automatisieren und die Software dabei aktiv mitgestalten wollen.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <Icon className="h-5 w-5 text-[#c8985a]" />
              <h3 className="mt-3 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-white/70">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-6 py-3 text-sm font-bold text-[#003856] transition-all hover:bg-[#e6a800] active:scale-95"
          >
            Design-Partner werden <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
