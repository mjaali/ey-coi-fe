import { cn } from "@/lib/utils";
import { surfaceClasses } from "@/theme";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  status?: "nominal" | "warn" | "critical" | "neutral";
  className?: string;
};

const statusDot: Record<NonNullable<StatCardProps["status"]>, string> = {
  nominal: "bg-modon-green shadow-[0_0_8px_color-mix(in_srgb,var(--modon-green)_55%,transparent)]",
  warn: "bg-warning shadow-[0_0_8px_color-mix(in_srgb,var(--warning)_55%,transparent)]",
  critical: "bg-destructive shadow-[0_0_8px_color-mix(in_srgb,var(--destructive)_55%,transparent)]",
  neutral: "bg-muted-foreground",
};

export function StatCard({
  label,
  value,
  hint,
  status = "neutral",
  className,
}: StatCardProps) {
  return (
    <div className={cn(surfaceClasses.glass, "p-3.5", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="hud-label">{label}</div>
        <span
          className={cn("mt-1 size-1.5 shrink-0 rounded-full", statusDot[status])}
          aria-hidden
        />
      </div>
      <div className="hud-value mt-2 text-foreground">{value}</div>
      {hint ? (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
