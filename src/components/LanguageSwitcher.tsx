"use client";

import { useTranslation, type Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "en", label: "🇬🇧 English" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <label className="inline-flex items-center gap-2 text-xs text-[#64748b]">
      <span className="sr-only">Sprache wählen</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="rounded-lg border border-[rgba(0,56,86,0.12)] bg-white px-2 py-1 text-xs text-[#003856] outline-none transition focus:border-[#003856]"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
