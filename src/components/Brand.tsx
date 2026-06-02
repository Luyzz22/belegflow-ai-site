import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-[#003856] ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="h-[60%] w-[60%]" fill="none">
        <path
          d="M9 22V10h11M9 16h8"
          stroke="#c8985a"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight text-[#003856] ${className}`}>
      FlowCheck <span className="text-[#c8985a]">AI+</span>
    </span>
  );
}

export function BrandLink({
  href = "/",
  size = "md",
  light = false,
}: {
  href?: string;
  size?: "sm" | "md";
  light?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <LogoMark className={size === "sm" ? "h-8 w-8" : "h-9 w-9"} />
      <span
        className={`font-semibold tracking-tight ${size === "sm" ? "text-base" : "text-lg"} ${
          light ? "text-white" : "text-[#003856]"
        }`}
      >
        FlowCheck <span className={light ? "text-[#c8985a]" : "text-[#c8985a]"}>AI+</span>
      </span>
    </Link>
  );
}
