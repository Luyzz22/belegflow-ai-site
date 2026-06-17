"use client";

import dynamic from "next/dynamic";
import { CardSkeleton, Skeleton } from "@/components/States";

// Recharts wird nur auf dieser Seite (client-seitig) geladen → kleineres Initial-Bundle.
const AnalyticsContent = dynamic(() => import("./AnalyticsContent"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <CardSkeleton />
      <Skeleton className="h-72 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  ),
});

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
