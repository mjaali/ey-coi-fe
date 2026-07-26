"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CountryProfile, RankRow } from "@/lib/customs/demand";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useDemandFormat } from "./format";

export function CountryProfileCard({
  locale,
  profile,
  periodLabel,
  onClear,
}: {
  locale: Locale;
  profile: CountryProfile;
  periodLabel: string;
  onClear: () => void;
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);

  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-foreground/15 bg-card p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl leading-none" aria-hidden>
            {profile.flag}
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {fmt.name(profile.name)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("profileSubtitle", {
                rank: fmt.integer.format(profile.rank),
                total: fmt.integer.format(profile.totalCountries),
                share: fmt.percent1.format(profile.share),
                period: periodLabel,
              })}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          {t("countryClear")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label={t("profileImports")}
          value={fmt.weight(profile.importKg)}
        />
        <Metric
          label={t("profileExports")}
          value={fmt.weight(profile.exportKg)}
        />
        <Metric
          label={profile.netKg >= 0 ? t("balanceSurplus") : t("balanceDeficit")}
          value={fmt.weight(Math.abs(profile.netKg))}
          tone={profile.netKg >= 0 ? "positive" : "neutral"}
        />
        <Metric
          label={t("profileImporters")}
          value={fmt.integer.format(profile.importers)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <MiniList
          locale={locale}
          title={t("profileTopProducts")}
          rows={profile.topChapters}
          accent="bg-emerald-500"
        />
        <MiniList
          locale={locale}
          title={t("profileTopCities")}
          rows={profile.topCities}
          accent="bg-sky-500"
        />
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive";
}) {
  return (
    <div className="rounded-2xl bg-muted/50 p-4">
      <div
        className={cn(
          "text-xl font-semibold tracking-tight tabular-nums",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MiniList({
  locale,
  title,
  rows,
  accent,
}: {
  locale: Locale;
  title: string;
  rows: RankRow[];
  accent: string;
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const max = rows[0]?.current.kg ?? 1;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{fmt.name(row.label)}</span>
                <span className="shrink-0 font-medium tabular-nums">
                  {fmt.weight(row.current.kg)}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", accent)}
                  style={{
                    width: `${Math.max((row.current.kg / max) * 100, 1.5)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
