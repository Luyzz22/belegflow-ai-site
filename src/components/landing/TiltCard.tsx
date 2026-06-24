"use client";

import { useRef, type ReactNode } from "react";

/** Pointer-driven 3D tilt + cursor glow. Pure transform/opacity; reduced-motion safe via CSS. */
export default function TiltCard({
  children,
  className = "",
  max = 8,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`fc-tilt ${glow ? "fc-tilt-glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
