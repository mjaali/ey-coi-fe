import { cn } from "@/lib/utils";
import { surfaceClasses } from "@/theme";

type SegmentedMeterProps = {
  label: string;
  valueLabel: string;
  /** 0–1 */
  ratio: number;
  segments?: number;
  className?: string;
};

export function SegmentedMeter({
  label,
  valueLabel,
  ratio,
  segments = 20,
  className,
}: SegmentedMeterProps) {
  const filled = Math.round(Math.min(1, Math.max(0, ratio)) * segments);

  return (
    <div className={cn(surfaceClasses.glass, "p-4", className)}>
      <div className="flex items-end justify-between gap-3">
        <div className="hud-label">{label}</div>
        <div className="font-mono text-lg font-semibold tabular-nums text-primary">
          {valueLabel}
        </div>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden>
        {Array.from({ length: segments }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-2.5 flex-1 rounded-[2px] transition-colors",
              index < filled
                ? "bg-modon-green shadow-[0_0_6px_color-mix(in_srgb,var(--modon-green)_45%,transparent)]"
                : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}
