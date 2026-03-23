import Link from "next/link";

export default function PublicNav({ cta = true }: { cta?: boolean }) {
  return (
    <nav className="fixed top-0 w-full bg-[#0a0a0a]/70 backdrop-blur-2xl border-b border-white/[0.06] z-50">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-sm text-white">BF</div>
          <span className="text-[22px] text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {[["/#features","Features"],["/guide","Guide"],["/faq","FAQ"],["/compliance","Trust"],["/api-docs","API"]].map(([h,l])=>(
            <Link key={h} href={h} className="text-sm text-[#a3a3a3] hover:text-white transition">{l}</Link>
          ))}
        </div>
        {cta && (
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 border border-white/[0.12] rounded-lg text-sm text-white hover:bg-white/[0.04] transition">Login</Link>
            <Link href="/demo" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm font-semibold text-white hover:bg-[#f48c06] transition">Demo anfragen</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
