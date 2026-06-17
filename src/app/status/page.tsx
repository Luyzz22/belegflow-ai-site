import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";
import StatusDashboard from "@/components/StatusDashboard";

export const metadata: Metadata = {
  title: "Systemstatus",
  description: "Aktueller Systemstatus von FlowCheck AI+ — Komponenten, Verfügbarkeit und Vorfälle.",
};

export default function StatusPage() {
  return (
    <PublicPage
      title="FlowCheck AI+ — Systemstatus"
      subtitle="Aktueller Betriebsstatus aller Komponenten in Echtzeit."
    >
      <StatusDashboard />
    </PublicPage>
  );
}
