// Bewusst KEINE erfundenen Nutzungszahlen (UWG-Risiko in der Pilotphase),
// sondern überprüfbare Produktfakten.
const FACTS = [
  "EN 16931 · XRechnung & ZUGFeRD",
  "DATEV-Export (EXTF 700)",
  "§14 UStG-Prüfung automatisch",
  "Hosting in Deutschland · DSGVO",
];

export default function SocialProofBar() {
  return (
    <div className="border-b border-[rgba(0,56,86,0.08)] bg-[#faf9f7]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 text-center text-sm text-[#64748b]">
        {FACTS.map((f, i) => (
          <span key={f} className="flex items-center gap-8">
            {i > 0 && <span aria-hidden className="hidden text-[#cbd5e1] sm:inline">·</span>}
            <span className="font-medium text-[#003856]">{f}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
