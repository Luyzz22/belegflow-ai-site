import { ImageResponse } from "next/og";

export const alt = "FlowCheck AI+ — KI-Rechnungsverarbeitung für den Mittelstand";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #003856 0%, #00263c 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, color: "#c8985a", fontWeight: 700 }}>
          FlowCheck AI+
        </div>
        <div style={{ marginTop: 28, fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
          KI-Rechnungsverarbeitung für den Mittelstand
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#cbd5e1", maxWidth: 880 }}>
          Automatisch prüfen, freigeben und DATEV-ready exportieren.
        </div>
        <div style={{ marginTop: 48, display: "flex", gap: 28, fontSize: 24, color: "#ffb900" }}>
          <span>Hosting Deutschland</span>
          <span>·</span>
          <span>DSGVO-konform</span>
          <span>·</span>
          <span>GoBD-ready</span>
        </div>
      </div>
    ),
    size
  );
}
