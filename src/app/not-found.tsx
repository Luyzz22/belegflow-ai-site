import Link from "next/link";
import { BrandLink } from "@/components/Brand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fa]">
      <div className="flex h-16 items-center px-6">
        <BrandLink />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-6xl font-semibold tracking-tight text-[#003856]">404</p>
        <h1 className="mt-4 text-xl font-semibold text-stone-800">Seite nicht gefunden</h1>
        <p className="mt-2 max-w-md text-sm text-stone-500">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#002a42]"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
