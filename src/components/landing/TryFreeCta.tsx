"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function TryFreeCta() {
  const { t } = useTranslation();
  return (
    <Link
      href="/register"
      className="inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-8 py-4 text-lg font-bold text-[#003856] transition-all hover:bg-[#e6a800] active:scale-95"
    >
      {t("cta.tryFree")}
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}
