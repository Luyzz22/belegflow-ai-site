import Link from "next/link";
import { Home, Search } from "lucide-react";
import { BrandLink } from "@/components/Brand";

export const metadata = { title: "Seite nicht gefunden — FlowCheck AI+" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f6f3]">
      <div className="flex h-16 items-center px-6">
        <BrandLink />
      </div>
      <div className="fc-grid-accent flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003856]/5 text-[#003856]">
          <Search className="h-8 w-8" />
        </div>
        <p className="text-6xl font-bold tracking-tight text-[#003856]">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-[#1a1a2e]">Seite nicht gefunden</h1>
        <p className="mt-2 max-w-md text-sm text-[#64748b]">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
          >
            <Home className="h-4 w-4" />
            Zum Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#003856] transition hover:bg-[#003856]/5 active:scale-95"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
