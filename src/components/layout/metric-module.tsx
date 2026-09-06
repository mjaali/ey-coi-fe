import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/components/layout/status-badge";
import { cn } from "@/lib/utils";
import { surfaceClasses } from "@/theme";

export type MetricModuleStat = {
  label: string;
  value: string;
};

type MetricModuleProps = {
  title: string;
  value: string;
  unit?: string;
  description?: string;
  statusLabel: string;
  statusTone?: "nominal" | "warn" | "critical" | "info" | "neutral";
  stats: MetricModuleStat[];
  href?: string | null;
  exploreLabel?: string;
  className?: string;
  children?: React.ReactNode;
};

function MetricModuleInner({
  title,
  value,
  unit,
  description,
  statusLabel,
  statusTone = "nominal",
  stats,
  exploreLabel,
  href,
  children,
}: MetricModuleProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="hud-label">{title}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              {value}
            </span>
            {unit ? (
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {unit}
              </span>
            ) : null}
          </div>
        </div>
        <StatusBadge label={statusLabel} tone={statusTone} />
      </div>

      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      {children}

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border/60 bg-background/35 px-2.5 py-2"
          >
            <dt className="hud-label truncate">{stat.label}</dt>
            <dd className="mt-1 font-mono text-sm font-semibold tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {href && exploreLabel ? (
        <div className="mt-4 flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary">
          {exploreLabel}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </div>
      ) : null}
    </>
  );
}

export function MetricModule({
  href,
  className,
  exploreLabel,
  ...props
}: MetricModuleProps) {
  const shellClass = cn(
    surfaceClasses.glass,
    "group relative flex h-full flex-col p-4 transition-[border-color,box-shadow,transform] duration-300",
    href &&
      "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--modon-green)_25%,transparent),0_18px_40px_-24px_rgba(61,255,138,0.45)]",
    !href && "opacity-80",
    className
  );

  if (href) {
    return (
      <Link href={href} className={shellClass}>
        <MetricModuleInner
          {...props}
          href={href}
          exploreLabel={exploreLabel}
        />
      </Link>
    );
  }

  return (
    <div className={shellClass}>
      <MetricModuleInner {...props} exploreLabel={exploreLabel} />
    </div>
  );
}
