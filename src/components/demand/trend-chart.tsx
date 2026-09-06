"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { SeriesPoint } from "@/lib/customs/demand";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { flowFillClasses } from "@/theme";
import { DeltaChip } from "./delta-chip";
import { useDemandFormat } from "./format";

const GRID_LINES = 4;

/**
 * Picks an axis maximum that divides into `GRID_LINES` round steps, so labels
 * read 1/2/3/4 Mt rather than 1.25/2.5/3.75/5 Mt.
 */
function niceMax(peak: number) {
  if (peak <= 0) return 1;
  const rawStep = peak / GRID_LINES;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalised = rawStep / magnitude;
  const step =
    (normalised <= 1
      ? 1
      : normalised <= 2
        ? 2
        : normalised <= 2.5
          ? 2.5
          : normalised <= 5
            ? 5
            : 10) * magnitude;
  return step * GRID_LINES;
}

export function TrendChart({
  locale,
  series,
  priorLabel,
  flow,
}: {
  locale: Locale;
  series: SeriesPoint[];
  priorLabel: string | null;
  flow: "import" | "export";
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const [hovered, setHovered] = useState<number | null>(null);

  const hasPrior = series.some((p) => p.priorKg !== null);

  const max = useMemo(() => {
    const peak = Math.max(
      ...series.map((p) => Math.max(p.kg, p.priorKg ?? 0)),
      1
    );
    return niceMax(peak);
  }, [series]);

  const priorPoints = useMemo(() => {
    if (!hasPrior || series.length === 0) return "";
    const step = 100 / series.length;
    return series
      .map((point, index) => {
        const x = step * index + step / 2;
        const y = 100 - ((point.priorKg ?? 0) / max) * 100;
        return `${x.toFixed(3)},${y.toFixed(3)}`;
      })
      .join(" ");
  }, [series, max, hasPrior]);

  const barColor =
    flow === "import" ? flowFillClasses.import : flowFillClasses.export;

  const active = hovered !== null ? series[hovered] : null;
  const activeDelta =
    active && active.priorKg !== null && active.priorKg > 0
      ? (active.kg - active.priorKg) / active.priorKg
      : null;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border/80 bg-card/85 p-4 backdrop-blur-md sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {flow === "import" ? t("trendTitleImport") : t("trendTitleExport")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("trendSubtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className={cn("h-2.5 w-2.5 rounded-sm", barColor)}
              aria-hidden
            />
            {t("legendCurrent")}
          </span>
          {hasPrior && priorLabel && (
            <span className="flex items-center gap-1.5">
              <span
                className="h-0 w-4 border-t-2 border-dashed border-muted-foreground"
                aria-hidden
              />
              {priorLabel}
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Y axis */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
            const value = max * (1 - i / GRID_LINES);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-end text-[10px] tabular-nums text-muted-foreground">
                  {fmt.weight(value)}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
            );
          })}
        </div>

        <div className="relative h-44 ltr:ml-14 rtl:mr-14">
          {/* Prior-period overlay */}
          {hasPrior && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <polyline
                points={priorPoints}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="text-muted-foreground/70"
              />
            </svg>
          )}

          {active && hovered !== null && (
            <div
              className="pointer-events-none absolute bottom-full z-10 mb-2 w-40 -translate-x-1/2 rounded-xl border border-border bg-popover p-3 shadow-lg rtl:translate-x-1/2"
              style={{ insetInlineStart: `${((hovered + 0.5) / series.length) * 100}%` }}
            >
              <div className="text-xs text-muted-foreground">
                {fmt.monthName(active.month, true)} {fmt.year(active.year)}
              </div>
              <div className="mt-0.5 text-base font-semibold tabular-nums">
                {fmt.weight(active.kg)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                {t("declarationsCount", {
                  count: fmt.integer.format(active.declarations),
                })}
              </div>
              {activeDelta !== null && (
                <DeltaChip
                  size="xs"
                  className="mt-1.5"
                  value={activeDelta}
                  label={fmt.signedPercent.format(activeDelta)}
                />
              )}
            </div>
          )}

          <div className="absolute inset-0 flex items-end gap-px">
            {series.map((point, index) => {
              const height = (point.kg / max) * 100;
              const isActive = hovered === index;
              return (
                <button
                  key={point.t}
                  type="button"
                  tabIndex={-1}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  className="group relative flex h-full min-w-0 flex-1 items-end"
                  aria-label={`${fmt.monthName(point.month, true)} ${point.year}: ${fmt.weight(point.kg)}`}
                >
                  <span
                    className={cn(
                      "absolute inset-0 transition-colors",
                      isActive && "bg-muted/60"
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "relative w-full rounded-t-[3px] transition-opacity",
                      barColor,
                      hovered !== null && !isActive && "opacity-40"
                    )}
                    style={{ height: `${Math.max(height, 0.5)}%` }}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* X axis */}
        <div className="flex gap-px ltr:ml-16 rtl:mr-16">
          {series.map((point, index) => {
            const showYear =
              index === 0 || series[index - 1].year !== point.year;
            const dense = series.length > 18;
            return (
              <div
                key={point.t}
                className="min-w-0 flex-1 pt-2 text-center text-[10px] leading-tight text-muted-foreground"
              >
                <div className="truncate">
                  {dense && !showYear && point.month % 3 !== 1
                    ? ""
                    : fmt.monthName(point.month).slice(0, 3)}
                </div>
                {showYear && (
                  <div className="truncate font-medium text-foreground/70">
                    {fmt.year(point.year)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
