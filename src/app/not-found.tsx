import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-[#e85d04] mb-4" style={{fontFamily:"'Instrument Serif',serif"}}>404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Seite nicht gefunden</h1>
        <p className="text-[#737373] text-sm mb-8">Die angeforderte Seite existiert nicht oder wurde verschoben.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-6 py-2.5 bg-[#e85d04] hover:bg-[#f48c06] rounded-xl text-sm font-medium text-white transition">Startseite</Link>
          <Link href="/dashboard" className="px-6 py-2.5 border border-[#262626] rounded-xl text-sm text-[#a3a3a3] hover:text-white hover:border-[#404040] transition">Dashboard</Link>
        </div>
        <p className="text-xs text-[#404040] mt-12">BelegFlow AI — Ein Produkt von SBS Deutschland GmbH & Co. KG</p>
      </div>
    </div>
  );
}
