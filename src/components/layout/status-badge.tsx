import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  tone?: "nominal" | "warn" | "critical" | "info" | "neutral";
  className?: string;
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  nominal:
    "border-modon-green/35 bg-success-muted text-success",
  warn: "border-warning/40 bg-warning-muted text-warning",
  critical: "border-destructive/40 bg-destructive/15 text-destructive",
  info: "border-modon-sky/35 bg-info-muted text-info",
  neutral: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em]",
        toneClasses[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
