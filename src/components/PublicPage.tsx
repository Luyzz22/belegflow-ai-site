import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";

export default function PublicPage({
  title,
  subtitle,
  children,
  narrow = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <PublicNav />
      <header className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h1 className="text-3xl font-semibold tracking-tight text-[#003856] sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-lg text-stone-600">{subtitle}</p>}
        </div>
      </header>
      <main className={`mx-auto px-6 py-12 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>{children}</main>
      <Footer />
    </div>
  );
}
