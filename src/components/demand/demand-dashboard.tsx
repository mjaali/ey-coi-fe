"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { StatCard } from "@/components/layout/stat-card";
import type { Locale } from "@/i18n/routing";
import type {
  CustomsDemandData,
  HsChapterRow,
  MonthPoint,
  TradeTotals,
} from "@/lib/customs/demand";
import { cn } from "@/lib/utils";

const MONTH_EN = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type YearFilter = "all" | number;

function kgToTonnes(kg: number) {
  return kg / 1000;
}

export function DemandDashboard({
  locale,
  data,
}: {
  locale: Locale;
  data: CustomsDemandData;
}) {
  const t = useTranslations("DemandPage");
  const [year, setYear] = useState<YearFilter>("all");

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
        maximumFractionDigits: 1,
      }),
    [locale]
  );
  const nfInt = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
        maximumFractionDigits: 0,
      }),
    [locale]
  );
  const pf = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
        style: "percent",
        maximumFractionDigits: 0,
      }),
    [locale]
  );

  const formatWeight = (kg: number) => {
    const tonnes = kgToTonnes(kg);
    if (tonnes >= 1_000_000) {
      return t("weightMt", { value: nf.format(tonnes / 1_000_000) });
    }
    if (tonnes >= 1_000) {
      return t("weightKt", { value: nf.format(tonnes / 1_000) });
    }
    return t("weightT", { value: nf.format(tonnes) });
  };

  const totals: TradeTotals =
    year === "all" ? data.totals : (data.byYear[String(year)] ?? data.totals);

  const importShare =
    totals.netWeightKg > 0 ? totals.importWeightKg / totals.netWeightKg : 0;

  const months: MonthPoint[] =
    year === "all"
      ? data.byMonth
      : data.byMonth.filter((m) => m.year === year);

  const maxMonthWeight = Math.max(...months.map((m) => m.importWeightKg), 1);

  const cities = data.byCity.slice(0, 10);
  const origins = data.byOrigin.slice(0, 10);
  const chapters = data.byHsChapter.slice(0, 10);
  const ports = data.byPort.slice(0, 8);

  const maxCity = cities[0]?.importWeightKg ?? 1;
  const maxOrigin = origins[0]?.importWeightKg ?? 1;
  const maxChapter = chapters[0]?.importWeightKg ?? 1;
  const maxPort = ports[0]?.importWeightKg ?? 1;

  const monthLabel = (m: MonthPoint) => {
    if (locale === "ar") return m.monthAr;
    return MONTH_EN[m.monthNum] ?? m.monthAr;
  };

  const chapterName = (c: HsChapterRow) =>
    locale === "ar" ? c.name.ar : c.name.en;

  const yearOptions: YearFilter[] = ["all", ...data.years];

  const stats = [
    {
      label: t("statDeclarations"),
      value: nfInt.format(totals.declarations),
    },
    {
      label: t("statImportWeight"),
      value: formatWeight(totals.importWeightKg),
    },
    {
      label: t("statCities"),
      value: nfInt.format(data.totals.cities),
    },
    {
      label: t("statOrigins"),
      value: nfInt.format(data.totals.originCountries),
    },
    {
      label: t("statImportShare"),
      value: pf.format(importShare),
      className: "col-span-2 sm:col-span-1",
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("yearFilter")}</span>
        <div className="flex flex-wrap gap-1.5">
          {yearOptions.map((option) => {
            const active = year === option;
            const label =
              option === "all" ? t("yearAll") : nfInt.format(option);
            return (
              <button
                key={String(option)}
                type="button"
                onClick={() => setYear(option)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            className={stat.className}
          />
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:p-7">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {t("trendTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("trendSubtitle")}</p>
        </div>
        <div className="flex h-40 items-end gap-1 sm:gap-1.5">
          {months.map((m) => {
            const height = (m.importWeightKg / maxMonthWeight) * 100;
            return (
              <div
                key={m.key}
                className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
              >
                <div
                  className="w-full rounded-t-sm bg-sky-500/90 transition-opacity group-hover:opacity-80"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${monthLabel(m)} ${m.year}: ${formatWeight(m.importWeightKg)}`}
                />
                <span className="mt-2 hidden truncate text-[10px] text-muted-foreground sm:block">
                  {year === "all"
                    ? `${monthLabel(m).slice(0, 3)}`
                    : monthLabel(m)}
                </span>
              </div>
            );
          })}
        </div>
        {year === "all" && (
          <p className="text-xs text-muted-foreground">{t("trendHint")}</p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RankPanel title={t("citiesTitle")} subtitle={t("citiesSubtitle")}>
          {cities.map((city, i) => (
            <RankRow
              key={city.nameAr}
              rank={i + 1}
              label={city.nameAr}
              primary={formatWeight(city.importWeightKg)}
              secondary={t("declarationsCount", {
                count: nfInt.format(city.importDeclarations),
              })}
              width={(city.importWeightKg / maxCity) * 100}
              accent="city"
            />
          ))}
        </RankPanel>

        <RankPanel title={t("originsTitle")} subtitle={t("originsSubtitle")}>
          {origins.map((origin, i) => (
            <RankRow
              key={origin.nameAr}
              rank={i + 1}
              label={origin.nameAr}
              primary={formatWeight(origin.importWeightKg)}
              secondary={t("declarationsCount", {
                count: nfInt.format(origin.importDeclarations),
              })}
              width={(origin.importWeightKg / maxOrigin) * 100}
              accent="origin"
            />
          ))}
        </RankPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RankPanel title={t("hsTitle")} subtitle={t("hsSubtitle")}>
          {chapters.map((chapter, i) => (
            <RankRow
              key={chapter.chapter}
              rank={i + 1}
              label={`${chapter.chapter} · ${chapterName(chapter)}`}
              primary={formatWeight(chapter.importWeightKg)}
              secondary={t("declarationsCount", {
                count: nfInt.format(chapter.importDeclarations),
              })}
              width={(chapter.importWeightKg / maxChapter) * 100}
              accent="hs"
            />
          ))}
        </RankPanel>

        <RankPanel title={t("portsTitle")} subtitle={t("portsSubtitle")}>
          {ports.map((port, i) => (
            <RankRow
              key={port.nameAr}
              rank={i + 1}
              label={port.nameAr}
              primary={formatWeight(port.importWeightKg)}
              secondary={t("declarationsCount", {
                count: nfInt.format(port.importDeclarations),
              })}
              width={(port.importWeightKg / maxPort) * 100}
              accent="port"
            />
          ))}
        </RankPanel>
      </section>
    </>
  );
}

function RankPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:p-7">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function RankRow({
  rank,
  label,
  primary,
  secondary,
  width,
  accent,
}: {
  rank: number;
  label: string;
  primary: string;
  secondary: string;
  width: number;
  accent: "city" | "origin" | "hs" | "port";
}) {
  const bar =
    accent === "city"
      ? "bg-sky-500"
      : accent === "origin"
        ? "bg-violet-500"
        : accent === "hs"
          ? "bg-emerald-500"
          : "bg-amber-500";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
            {rank}
          </span>
          <span className="truncate font-medium">{label}</span>
        </div>
        <div className="shrink-0 text-end">
          <span className="font-semibold">{primary}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", bar)}
            style={{ width: `${Math.max(width, 4)}%` }}
          />
        </div>
        <span className="w-28 shrink-0 text-end text-xs text-muted-foreground sm:text-sm">
          {secondary}
        </span>
      </div>
    </div>
  );
}
