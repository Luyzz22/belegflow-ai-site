"use client";

/** CSS-only Konfetti — 24 Partikel mit zufälliger Position/Rotation/Farbe.
 *  Keine Library. Wird kurz eingeblendet (Eltern steuert Sichtbarkeit). */
const COLORS = ["#003856", "#c8985a", "#ffb900", "#059669", "#3b82f6"];

export default function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => {
    const left = (i * 4.1 + (i % 5) * 3) % 100;
    const delay = (i % 6) * 90;
    const duration = 1600 + (i % 5) * 250;
    const color = COLORS[i % COLORS.length];
    const round = i % 2 === 0;
    const rot = (i * 47) % 360;
    return (
      <span
        key={i}
        className="fc-confetti absolute top-0 h-2.5 w-2.5"
        style={{
          left: `${left}%`,
          backgroundColor: color,
          borderRadius: round ? "9999px" : "2px",
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}ms`,
          transform: `rotate(${rot}deg)`,
        }}
      />
    );
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces}
    </div>
  );
}
