"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export default function ProductFilm() {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(false);
  const userPausedRef = useRef(false);
  const manualPlayRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const [enhanced, setEnhanced] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video) return;

    setEnhanced(true);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionPreference.matches;

    const syncPlayback = () => {
      const motionAllowed = !reducedMotionRef.current || manualPlayRef.current;
      if (inViewRef.current && motionAllowed && !userPausedRef.current && !document.hidden) {
        void video.play().catch(() => setPlaying(false));
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.45;
        syncPlayback();
      },
      { threshold: [0, 0.45, 0.75] }
    );

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) manualPlayRef.current = false;
      syncPlayback();
    };

    observer.observe(stage);
    document.addEventListener("visibilitychange", syncPlayback);
    motionPreference.addEventListener("change", onMotionPreferenceChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      manualPlayRef.current = true;
      userPausedRef.current = false;
      void video.play().catch(() => setPlaying(false));
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  return (
    <section
      className="overflow-hidden border-b border-[rgba(0,56,86,0.08)] bg-white py-20 sm:py-28"
      aria-labelledby="product-film-title"
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <div className="mx-auto max-w-3xl px-3 text-center sm:px-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">FlowCheck AI+ in Aktion</p>
          <h2 id="product-film-title" className="mt-3 text-3xl font-bold leading-tight text-[#1a1a2e] sm:text-5xl">
            Vom Beleg zur Freigabe.<br />In einem klaren Flow.
          </h2>
          <p id="product-film-description" className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#64748b] sm:text-lg">
            FlowCheck AI+ erfasst Rechnungen, prüft Pflichtangaben, bereitet die Kontierung vor und bringt jeden Vorgang kontrolliert zur Freigabe.
          </p>
        </div>

        <div
          ref={stageRef}
          className="relative mt-10 aspect-video overflow-hidden rounded-lg border border-[rgba(0,56,86,0.12)] bg-[#0b1b26] shadow-[0_32px_90px_rgba(0,56,86,0.18)] sm:mt-14"
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            controls={!enhanced}
            poster="/media/flowcheck-product-tour-poster.jpg"
            aria-describedby="product-film-description"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src="/media/flowcheck-product-tour.mp4" type="video/mp4" />
          </video>

          {enhanced && (
            <button
              type="button"
              onClick={togglePlayback}
              className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-[#0b1b26]/75 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-[#0b1b26] sm:bottom-5 sm:right-5"
              aria-label={playing ? "Video pausieren" : "Video abspielen"}
              aria-pressed={playing}
              title={playing ? "Video pausieren" : "Video abspielen"}
            >
              {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-1 px-1 text-xs font-medium text-[#64748b] sm:flex-row sm:justify-between sm:text-sm">
          <span>FlowCheck AI+ Produktansicht</span>
          <span>Erfassen · Prüfen · Kontieren · Freigeben</span>
        </div>
      </div>
    </section>
  );
}
