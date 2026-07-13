"use client";

import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  Braces,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  FileOutput,
  FileText,
  LockKeyhole,
  ScanText,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const AUTO_ADVANCE_MS = 7200;

const SLIDES = [
  {
    id: "intake",
    index: "01",
    label: "Intake",
    eyebrow: "Eingang und Erfassung",
    title: "Rechnungen. Klar im Fluss.",
    description:
      "PDF, XRechnung und ZUGFeRD werden zentral erfasst und für die weitere Prüfung strukturiert vorbereitet.",
    meta: "PDF · XRechnung · ZUGFeRD",
  },
  {
    id: "control",
    index: "02",
    label: "Control",
    eyebrow: "Prüfung und Freigabe",
    title: "Jeder Schritt. Nachvollziehbar.",
    description:
      "Validierung, Freigaben und Statuswechsel bleiben in einem kontrollierten Prozess sichtbar.",
    meta: "Validierung · Freigaben · Audit Trail",
  },
  {
    id: "output",
    index: "03",
    label: "Output",
    eyebrow: "Übergabe und Integration",
    title: "Freigegeben. Bereit für den nächsten Prozess.",
    description:
      "Geprüfte Rechnungsdaten fließen kontrolliert in DATEV-Exporte und angebundene Systeme weiter.",
    meta: "DATEV CSV · API · Prozessübergabe",
  },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

function SurfaceLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
      <span className="text-[#d8a565]">{icon}</span>
      {children}
    </div>
  );
}

function IntakeScene() {
  return (
    <div className="fc-hero-scene absolute -right-[45%] top-[46%] h-[54%] w-[128%] opacity-55 sm:-right-[18%] sm:top-[9%] sm:h-[78%] sm:w-[84%] sm:opacity-100 lg:-right-[2%] lg:top-[8%] lg:w-[64%]">
      <div className="absolute inset-0 border border-white/12 bg-[#0a1117]/95 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="flex h-12 items-center justify-between border-b border-white/10 px-5">
          <SurfaceLabel icon={<Workflow className="h-3.5 w-3.5" />}>FlowCheck Workspace</SurfaceLabel>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">Verarbeitung aktiv</span>
        </div>

        <div className="grid h-[calc(100%-3rem)] grid-cols-[3.5rem_1.15fr_0.85fr] sm:grid-cols-[4.5rem_1.2fr_0.8fr]">
          <div className="border-r border-white/10 px-3 py-5">
            {[FileText, ScanText, ShieldCheck, FileOutput].map((Icon, index) => (
              <div
                key={Icon.displayName ?? index}
                className={`mb-4 flex h-8 items-center justify-center border ${
                  index === 1 ? "border-[#d8a565]/60 bg-[#d8a565]/10 text-[#f2c488]" : "border-white/10 text-white/35"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden border-r border-white/10 p-5 sm:p-7">
            <div className="mb-5 flex items-end justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Dokument</p>
                <p className="mt-1 text-sm font-medium text-white/90">Eingangsrechnung</p>
              </div>
              <span className="font-mono text-[10px] text-white/40">PDF</span>
            </div>

            <div className="relative mx-auto h-[70%] max-w-[21rem] border border-white/15 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-white/70" />
                <FileText className="h-5 w-5 text-[#d8a565]" />
              </div>
              <div className="mt-8 space-y-3">
                <div className="h-px w-full bg-white/16" />
                <div className="h-px w-4/5 bg-white/12" />
                <div className="h-px w-2/3 bg-white/12" />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-1.5 w-12 bg-white/20" />
                  <div className="h-2 w-20 bg-white/60" />
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-12 bg-white/20" />
                  <div className="h-2 w-16 bg-white/60" />
                </div>
              </div>
              <div className="fc-hero-scan absolute inset-x-3 top-0 h-px bg-[#f2c488] shadow-[0_0_18px_rgba(242,196,136,0.85)]" />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Struktur</p>
            <div className="mt-5 space-y-4">
              {["Pflichtfelder", "Beträge", "Kontierung", "Freigabeweg"].map((label, index) => (
                <div key={label} className="border-b border-white/10 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-white/65">{label}</span>
                    {index < 3 ? (
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                    ) : (
                      <span className="h-1.5 w-1.5 bg-[#d8a565]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 border border-emerald-300/30 bg-emerald-300/[0.06] px-3 py-3 text-xs font-medium text-emerald-200">
              Bereit zur Prüfung
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlScene() {
  const stages = [
    { icon: FileText, label: "Eingang" },
    { icon: ShieldCheck, label: "Policy" },
    { icon: CheckCircle2, label: "Freigabe" },
  ];

  return (
    <div className="fc-hero-scene absolute -right-[45%] top-[46%] h-[54%] w-[128%] opacity-55 sm:-right-[18%] sm:top-[8%] sm:h-[74%] sm:w-[86%] sm:opacity-100 lg:-right-[2%] lg:w-[65%]">
      <div className="absolute inset-0 border border-white/12 bg-[#091015]/95 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="grid h-full grid-cols-[1.3fr_0.7fr]">
          <div className="relative border-r border-white/10 p-5 sm:p-8">
            <SurfaceLabel icon={<LockKeyhole className="h-3.5 w-3.5" />}>Control Layer</SurfaceLabel>
            <div className="mt-12 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 sm:mt-20 sm:gap-4">
              {stages.map(({ icon: Icon, label }, index) => (
                <div key={label} className="contents">
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center border sm:h-16 sm:w-16 ${
                      index === 1 ? "border-[#d8a565] bg-[#d8a565]/10 text-[#f2c488]" : "border-white/20 bg-[#0d171e] text-white/70"
                    }`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50 sm:text-[10px]">{label}</span>
                  </div>
                  {index < stages.length - 1 && (
                    <div className="relative h-px bg-white/18">
                      <span className={`fc-hero-flow absolute -top-1 h-2 w-2 bg-[#d8a565] ${index === 1 ? "[animation-delay:1.2s]" : ""}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-3 border-y border-white/10 py-4 text-center sm:mt-16">
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Zustand</p>
                <p className="mt-1 text-xs font-medium text-emerald-200">Geprüft</p>
              </div>
              <div className="border-x border-white/10">
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Rolle</p>
                <p className="mt-1 text-xs font-medium text-white/75">Finance</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Protokoll</p>
                <p className="mt-1 text-xs font-medium text-white/75">Aktiv</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-7">
            <SurfaceLabel icon={<Archive className="h-3.5 w-3.5" />}>Audit Trail</SurfaceLabel>
            <div className="relative mt-8 space-y-7 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-white/15">
              {["Dokument erfasst", "Validierung abgeschlossen", "Zur Freigabe bereit", "Status protokolliert"].map((item, index) => (
                <div key={item} className="relative flex gap-4 pl-0">
                  <span className={`relative z-10 mt-1 h-3 w-3 shrink-0 border ${
                    index < 3 ? "border-emerald-300 bg-emerald-300" : "border-[#d8a565] bg-[#091015]"
                  }`} />
                  <div>
                    <p className="text-xs text-white/70">{item}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Schritt 0{index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutputScene() {
  const outputs = [
    { icon: Database, label: "DATEV CSV", status: "Export" },
    { icon: Braces, label: "API", status: "Integration" },
    { icon: Archive, label: "Archiv", status: "Ablage" },
  ];

  return (
    <div className="fc-hero-scene absolute -right-[45%] top-[46%] h-[54%] w-[128%] opacity-55 sm:-right-[18%] sm:top-[7%] sm:h-[76%] sm:w-[86%] sm:opacity-100 lg:-right-[2%] lg:w-[65%]">
      <div className="absolute inset-0 border border-white/12 bg-[#091015]/95 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="flex h-12 items-center justify-between border-b border-white/10 px-5 sm:px-7">
          <SurfaceLabel icon={<FileOutput className="h-3.5 w-3.5" />}>Process Output</SurfaceLabel>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">Controlled handoff</span>
        </div>

        <div className="grid h-[calc(100%-3rem)] grid-cols-[0.78fr_1.22fr]">
          <div className="flex items-center justify-center border-r border-white/10 p-5">
            <div className="relative flex h-32 w-32 items-center justify-center border border-[#d8a565]/60 bg-[#d8a565]/[0.06] sm:h-44 sm:w-44">
              <div className="absolute inset-3 border border-white/10" />
              <div className="text-center">
                <Workflow className="mx-auto h-7 w-7 text-[#f2c488] sm:h-9 sm:w-9" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">FlowCheck</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-emerald-200">Freigegeben</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-5 py-6 sm:px-8">
            {outputs.map(({ icon: Icon, label, status }, index) => (
              <div key={label} className={`relative grid grid-cols-[1fr_auto] items-center py-5 ${index < outputs.length - 1 ? "border-b border-white/10" : ""}`}>
                <div className="relative flex items-center gap-4">
                  <div className="relative h-px w-8 bg-white/18 sm:w-16">
                    <span
                      className="fc-hero-flow absolute -top-1 h-2 w-2 bg-[#d8a565]"
                      style={{ animationDelay: `${index * 0.7}s` }}
                    />
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center border border-white/18 text-white/65 sm:h-12 sm:w-12">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/85">{label}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">{status}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-300/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideScene({ slideId }: { slideId: SlideId }) {
  if (slideId === "control") return <ControlScene />;
  if (slideId === "output") return <OutputScene />;
  return <IntakeScene />;
}

function SlideArrows({ onPrevious, onNext }: { onPrevious: () => void; onNext: () => void }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onPrevious}
        className="flex h-10 w-10 items-center justify-center border border-white/22 text-white/75 transition-colors hover:border-white/60 hover:text-white"
        aria-label="Vorheriger Slide"
        title="Vorheriger Slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="flex h-10 w-10 items-center justify-center border border-white/22 text-white/75 transition-colors hover:border-white/60 hover:text-white"
        aria-label="Nächster Slide"
        title="Nächster Slide"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function InteractiveHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const slide = SLIDES[activeIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const goToSlide = (index: number) => setActiveIndex((index + SLIDES.length) % SLIDES.length);

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 48) return;
    goToSlide(activeIndex + (distance < 0 ? 1 : -1));
  };

  return (
    <section
      className="relative isolate h-[calc(100svh-8.5rem)] min-h-[480px] max-h-[720px] overflow-hidden border-b border-white/10 bg-[#05080b] text-white"
      aria-label="FlowCheck AI+ Produktübersicht"
      aria-roledescription="Karussell"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={handleTouchEnd}
      data-testid="hero-carousel"
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute inset-y-0 left-0 z-10 w-full bg-[linear-gradient(90deg,#05080b_0%,rgba(5,8,11,0.97)_62%,rgba(5,8,11,0.7)_82%,rgba(5,8,11,0.15)_100%)] sm:w-[68%] lg:w-[62%]" />
        <div key={slide.id} className="fc-hero-slide absolute inset-0">
          <SlideScene slideId={slide.id} />
        </div>
      </div>

      <div className="relative z-20 mx-auto flex h-full max-w-[1440px] flex-col justify-between px-5 py-6 sm:px-8 sm:py-9 lg:px-12 lg:py-12">
        <div className="max-w-xl pt-1 sm:pt-4 lg:pt-8" aria-live={paused ? "polite" : "off"}>
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e1b579] sm:text-xs">
            <span className="h-px w-10 bg-[#d8a565]" />
            {slide.eyebrow}
          </div>
          <h1 className="mt-4 text-[2.85rem] font-semibold leading-none tracking-[0] text-white sm:mt-6 sm:whitespace-nowrap sm:text-[4.65rem] lg:text-[4.8rem]">
            FlowCheck AI+
          </h1>
          <p className="mt-3 max-w-lg text-2xl font-medium leading-tight tracking-[0] text-white/92 sm:mt-4 sm:text-3xl lg:text-[2.25rem]">
            {slide.title}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/58 sm:mt-5 sm:text-base">
            {slide.description}
          </p>

          <div className="mt-6 flex flex-col items-start gap-4 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <Link
              href="/register"
              className="group inline-flex shrink-0 items-center gap-3 border border-white bg-[#f4f5f6] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#071016] transition-colors hover:bg-[#d8a565] hover:text-[#071016] sm:px-6 sm:py-3.5"
            >
              Kostenlos testen
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#product-film-title"
              className="inline-flex shrink-0 items-center gap-3 border-b border-white/35 pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/82 transition-colors hover:border-[#d8a565] hover:text-white"
            >
              Produkt ansehen
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 flex max-w-sm items-center gap-4 md:hidden">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              {slide.index} / 03
            </span>
            <span className="h-px flex-1 bg-white/18">
              <span
                key={`mobile-${slide.id}-${activeIndex}`}
                className={`fc-hero-progress block h-full bg-[#d8a565] ${paused ? "[animation-play-state:paused]" : ""}`}
              />
            </span>
            <SlideArrows
              onPrevious={() => goToSlide(activeIndex - 1)}
              onNext={() => goToSlide(activeIndex + 1)}
            />
          </div>
        </div>

        <div className="hidden items-end justify-between gap-5 border-t border-white/14 pt-5 md:flex">
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-white/38 sm:block">{slide.meta}</p>

          <div className="ml-auto flex items-end gap-5">
            <div className="hidden gap-5 md:flex" aria-label="Slides auswählen">
              {SLIDES.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className="w-28 text-left"
                    aria-label={`Slide ${index + 1}: ${item.label}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                      <span>{item.index}</span>
                      <span className={isActive ? "text-white/80" : ""}>{item.label}</span>
                    </span>
                    <span className="mt-2 block h-px overflow-hidden bg-white/18">
                      {isActive && (
                        <span
                          key={`${item.id}-${activeIndex}`}
                          className={`fc-hero-progress block h-full bg-[#d8a565] ${paused ? "[animation-play-state:paused]" : ""}`}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <SlideArrows
              onPrevious={() => goToSlide(activeIndex - 1)}
              onNext={() => goToSlide(activeIndex + 1)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
