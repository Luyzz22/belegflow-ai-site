"use client";

import { useEffect, useState } from "react";

// Nur beim Drucken sichtbar: Kopf (Logo) und Fuß (Zeitstempel + Vertraulichkeitshinweis).
export default function PrintFrame() {
  const [stamp, setStamp] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => setStamp(new Date().toLocaleString("de-DE")));
  }, []);

  return (
    <>
      <div className="fc-print-header">FlowCheck AI+</div>
      <div className="fc-print-footer">
        {stamp ? `Generiert am ${stamp} · ` : ""}Vertraulich — FlowCheck AI+ / SBS Deutschland GmbH &amp; Co. KG
      </div>
    </>
  );
}
