import { ImageResponse } from "next/og";

// PWA-Icon 192×192 — SBS-Blau (#003856) mit weißem „F".
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#003856",
          color: "#ffffff",
          fontSize: 120,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        F
      </div>
    ),
    { width: 192, height: 192 }
  );
}
