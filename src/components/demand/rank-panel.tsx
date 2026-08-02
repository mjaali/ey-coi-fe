"use client";

import { useTranslations } from "next-intl";
import type { RankRow } from "@/lib/customs/demand";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { legacyAccentFillClasses, type LegacyAccent } from "@/theme";
import { DeltaChip } from "./delta-chip";
import { useDemandFormat } from "./format";

export type Accent = LegacyAccent;

const ACCENT_BAR = legacyAccentFillClasses;

export function RankPanel({
  locale,
  title,
  subtitle,
  rows,
  accent,
  /** Highlights the row matching this country code. */
  activeCode,
  /** When provided, rows become buttons that toggle the country filter. */
  onSelect,
  emptyLabel,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
  rows: RankRow[];
  accent: Accent;
  activeCode?: string | null;
  onSelect?: (code: string | null) => void;
  emptyLabel?: string;
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const max = rows[0]?.current.kg ?? 1;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {emptyLabel ?? t("emptyState")}
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((row, index) => {
            const isActive = Boolean(
              activeCode && row.code && row.code === activeCode
            );
            const clickable = Boolean(onSelect && row.code);

            const content = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                        isActive
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {fmt.integer.format(index + 1)}
                    </span>
                    {row.flag && (
                      <span className="shrink-0 text-base leading-none" aria-hidden>
                        {row.flag}
                      </span>
                    )}
                    <span className="truncate text-sm font-medium sm:text-base">
                      {fmt.name(row.label)}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-baseline gap-2">
                    <DeltaChip
                      size="xs"
                      value={row.deltaKg}
                      label={
                        row.deltaKg === null
                          ? ""
                          : fmt.signedPercent.format(row.deltaKg)
                      }
                    />
                    <span className="text-sm font-semibold tabular-nums sm:text-base">
                      {fmt.weight(row.current.kg)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", ACCENT_BAR[accent])}
                      style={{
                        width: `${Math.max((row.current.kg / max) * 100, 1.5)}%`,
                      }}
                    />
                  </div>
                  <span className="w-11 shrink-0 text-end text-xs tabular-nums text-muted-foreground">
                    {fmt.percent1.format(row.share)}
                  </span>
                  <span className="hidden w-24 shrink-0 text-end text-xs tabular-nums text-muted-foreground sm:block">
                    {t("declarationsCount", {
                      count: fmt.integer.format(row.current.declarations),
                    })}
                  </span>
                </div>
              </>
            );

            return (
              <li key={row.key}>
                {clickable ? (
                  <button
                    type="button"
                    onClick={() =>
                      onSelect?.(isActive ? null : (row.code ?? null))
                    }
                    aria-pressed={isActive}
                    className={cn(
                      "w-full rounded-xl px-2 py-1.5 text-start transition-colors -mx-2",
                      isActive ? "bg-muted" : "hover:bg-muted/60"
                    )}
                  >
                    {content}
                  </button>
                ) : (
                  <div className="px-0 py-1.5">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
