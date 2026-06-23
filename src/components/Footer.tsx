import Link from "next/link";
import { LogoMark } from "@/components/Brand";
import TrustBadges from "@/components/TrustBadges";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LINKS: [string, string][] = [
  ["/e-rechnung-pruefen", "E-Rechnung prüfen"],
  ["/wissen", "Wissen"],
  ["/trust", "Trust Center"],
  ["/status", "Systemstatus"],
  ["/sicherheit", "Sicherheit"],
  ["/compliance", "Compliance"],
  ["/avv", "AVV"],
  ["/impressum", "Impressum"],
  ["/datenschutz", "Datenschutz"],
  ["/agb", "AGB"],
];

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(0,56,86,0.08)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="text-base font-semibold tracking-tight text-[#003856]">
              FlowCheck <span className="text-[#c8985a]">AI+</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LINKS.map(([href, label]) => (
              <Link
                key={href + label}
                href={href}
                className="text-sm text-[#64748b] transition-all hover:text-[#003856]"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-[rgba(0,56,86,0.08)] pt-6">
          <TrustBadges className="mb-5" />
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-[#64748b]">
              © {new Date().getFullYear()} SBS Deutschland GmbH &amp; Co. KG
            </p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-[#64748b]">🇩🇪 Entwickelt und gehostet in Deutschland</p>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
