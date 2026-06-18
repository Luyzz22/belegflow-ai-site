import HelpTooltip from "@/components/HelpTooltip";

export default function PageHeader({
  title,
  description,
  action,
  help,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  help?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-[#1a1a2e]">
          {title}
          {help && <HelpTooltip text={help} />}
        </h1>
        {description && <p className="mt-1.5 text-sm text-[#64748b]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
