"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type {
  CommandCenterData,
  CommandCenterFilters,
  CommandCenterKpi,
  GapMatrixItem,
  Severity,
} from "@/lib/command-center/data";
import { commandCenterQuery } from "@/lib/command-center/query";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/layout/stat-card";
import { FilterBar } from "@/components/filters/filter-bar";
import { NationalGapMap } from "./national-gap-map";

type DashboardProps = {
  locale: Locale;
  data: CommandCenterData;
};

type SortKey = "productCategory" | "sector" | "gapStatus";
type SortDirection = "asc" | "desc";

function localized(locale: Locale, value: { en: string; ar: string }) {
  return locale === "ar" ? value.ar : value.en;
}

function useFormatters(locale: Locale) {
  return useMemo(() => {
    const tag = locale === "ar" ? "ar-u-nu-latn" : "en-US";
    const compact = new Intl.NumberFormat(tag, {
      notation: "compact",
      maximumFractionDigits: 1,
    });
    const integer = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
    const percent = new Intl.NumberFormat(tag, {
      style: "percent",
      maximumFractionDigits: 0,
    });
    const percent1 = new Intl.NumberFormat(tag, {
      style: "percent",
      maximumFractionDigits: 1,
    });
    const signedPercent = new Intl.NumberFormat(tag, {
      style: "percent",
      maximumFractionDigits: 1,
      signDisplay: "exceptZero",
    });
    const currency = (value: number | null) =>
      value === null ? "—" : `SAR ${compact.format(value)}`;
    return { compact, integer, percent, percent1, signedPercent, currency };
  }, [locale]);
}

function delta(current: number | null, previous: number | null) {
  if (current === null || previous === null || previous <= 0) return null;
  return (current - previous) / previous;
}

function gapStatusTone(status: GapMatrixItem["gapStatus"]) {
  switch (status) {
    case "exportedManufactured":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "manufacturedNotExported":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "importedNotManufactured":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case "emerging":
    default:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
}

function severityTone(severity: Severity) {
  switch (severity) {
    case "critical":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case "high":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    default:
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }
}

export function CommandCenterDashboard({
  locale,
  data,
}: DashboardProps) {
  const t = useTranslations("GapAnalysisPage");
  const fmt = useFormatters(locale);
  const router = useRouter();
  const pathname = usePathname();
  const [sortKey, setSortKey] = useState<SortKey>("productCategory");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(0);

  const pushFilters = (next: Partial<CommandCenterFilters>) => {
    const query = commandCenterQuery({ ...data.filters, ...next });
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const sortedMatrix = useMemo(() => {
    const rows = [...data.gapMatrix];
    rows.sort((a, b) => {
      const left =
        sortKey === "productCategory"
          ? localized(locale, a.productCategory)
          : sortKey === "sector"
            ? localized(locale, a.sector)
            : t(`gapStatus.${a.gapStatus}`);
      const right =
        sortKey === "productCategory"
          ? localized(locale, b.productCategory)
          : sortKey === "sector"
            ? localized(locale, b.sector)
            : t(`gapStatus.${b.gapStatus}`);
      const comparison = left.localeCompare(right, locale === "ar" ? "ar" : "en");
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return rows;
  }, [data.gapMatrix, locale, sortDirection, sortKey, t]);

  const pageSize = 6;
  const pagedMatrix = sortedMatrix.slice(page * pageSize, (page + 1) * pageSize);
  const pageCount = Math.max(1, Math.ceil(sortedMatrix.length / pageSize));

  const kpiLabels: Record<CommandCenterKpi["label"], string> = {
    totalExportValue: t("kpis.totalExportValue"),
    totalManufacturingValue: t("kpis.totalManufacturingValue"),
    totalImportValue: t("kpis.totalImportValue"),
    manufacturingGaps: t("kpis.manufacturingGaps"),
    localizationScore: t("kpis.localizationScore"),
    priorityOpportunities: t("kpis.priorityOpportunities"),
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(13rem,15rem)_minmax(0,1fr)]">
      <aside className="relative z-20 lg:sticky lg:top-14 lg:self-start">
        <FilterBar
          locale={locale}
          filters={data.filters}
          periods={data.periods}
          countries={data.countries}
        />
      </aside>

      <div className="flex min-w-0 flex-col gap-8">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        {data.kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-3.5">
            <StatCard
              label={kpiLabels[kpi.label]}
              value={
                kpi.format === "currency"
                  ? fmt.currency(kpi.value)
                  : kpi.format === "score"
                    ? `${fmt.integer.format(kpi.value ?? 0)} / 100`
                    : fmt.integer.format(kpi.value ?? 0)
              }
              className="border-0 bg-transparent p-0"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {delta(kpi.value, kpi.previousValue) === null
                ? t("comparisonUnavailable")
                : t("comparisonDelta", {
                    value: fmt.signedPercent.format(
                      delta(kpi.value, kpi.previousValue) ?? 0
                    ),
                  })}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(16rem,.6fr)_minmax(16rem,.6fr)]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold tracking-tight">{t("pulse.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("pulse.subtitle")}</p>
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
                {t("pulse.context")}
              </p>
            </div>
            <Gauge
              value={data.pulse.selfSufficiency}
              label={t("pulse.metric")}
            />
          </div>
        </div>

        <MetricCard
          title={t("pulse.localizationPotential")}
          value={fmt.currency(data.pulse.localizationPotentialValue)}
          detail={t("pulse.sectorsCount", {
            count: fmt.integer.format(data.pulse.localizationSectorCount),
          })}
        />

        <MetricCard
          title={t("pulse.exportGrowthOpportunity")}
          value={fmt.currency(data.pulse.exportOpportunityValue)}
          detail={t("pulse.sectorsCount", {
            count: fmt.integer.format(data.pulse.exportOpportunitySectorCount),
          })}
          change={
            data.pulse.exportOpportunityYoY === null
              ? null
              : fmt.signedPercent.format(data.pulse.exportOpportunityYoY)
          }
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)_minmax(0,.9fr)]">
        <Panel title={t("highlights.title")} subtitle={t("highlights.subtitle")}>
          {data.highlights.length === 0 ? (
            <EmptyCopy>{t("empty.highlights")}</EmptyCopy>
          ) : (
            <div className="flex flex-col gap-3">
              {data.highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                        highlight.tone === "positive"
                          ? "bg-emerald-500"
                          : highlight.tone === "warning"
                            ? "bg-amber-500"
                            : "bg-sky-500"
                      )}
                      aria-hidden
                    />
                    <div>
                      <h3 className="text-sm font-semibold">
                        {localized(locale, highlight.title)}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {localized(locale, highlight.description)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={t("map.title")} subtitle={t("map.subtitle")}>
          <NationalGapMap
            locale={locale}
            filters={data.filters}
            points={data.mapPoints}
            selection={data.mapSelection}
            className="h-[min(55vh,28rem)] w-full"
          />

          {data.mapSelection && (
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-sm font-semibold">
                {localized(locale, data.mapSelection.name)}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <KeyValue
                  label={t("map.selection.gapSeverity")}
                  value={`${fmt.integer.format(data.mapSelection.severityScore)} / 100`}
                />
                <KeyValue
                  label={t("map.selection.output")}
                  value={fmt.currency(data.mapSelection.outputValue)}
                />
                <KeyValue
                  label={t("map.selection.opportunity")}
                  value={fmt.currency(data.mapSelection.opportunityValue)}
                />
              </div>
            </div>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel
            title={t("readiness.title")}
            subtitle={t("readiness.subtitle")}
            contentClassName="gap-3"
          >
            {data.regionReadiness.map((region, index) => (
              <button
                key={region.id}
                type="button"
                onClick={() => pushFilters({ region: region.id, industrialCity: "all" })}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-xl border border-border bg-background p-3 text-start transition-colors hover:border-foreground/20",
                  data.filters.region === region.id && "border-foreground/25 bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {fmt.integer.format(index + 1)}
                    </span>
                    <span className="text-sm font-medium">
                      {localized(locale, region.name)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {fmt.integer.format(region.score)}
                  </span>
                </div>
                <Progress value={region.score / 100} />
              </button>
            ))}
          </Panel>

          <Panel title={t("criticalGaps.title")} subtitle={t("criticalGaps.subtitle")}>
            {data.criticalGaps.length === 0 ? (
              <EmptyCopy>{t("empty.criticalGaps")}</EmptyCopy>
            ) : (
              <div className="flex flex-col gap-3">
                {data.criticalGaps.map((gap, index) => (
                  <div key={gap.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          #{fmt.integer.format(index + 1)}
                        </div>
                        <div className="text-sm font-semibold">
                          {localized(locale, gap.industry)}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          severityTone(gap.severity)
                        )}
                      >
                        {t(`severity.${gap.severity}`)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold">
                      {fmt.currency(gap.importGapValue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title={t("topGaps.title")} subtitle={t("topGaps.subtitle")}>
          {data.manufacturingGaps.length === 0 ? (
            <EmptyCopy>{t("empty.gaps")}</EmptyCopy>
          ) : (
            <div className="flex flex-col gap-3">
              {data.manufacturingGaps.map((gap, index) => (
                <div key={gap.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        #{fmt.integer.format(index + 1)}
                      </div>
                      <h3 className="text-base font-semibold">
                        {localized(locale, gap.industry)}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        severityTone(gap.severity)
                      )}
                    >
                      {t(`severity.${gap.severity}`)}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <KeyValue
                      label={t("topGaps.importGap")}
                      value={fmt.currency(gap.importGapValue)}
                    />
                    <KeyValue
                      label={t("topGaps.localCoverage")}
                      value={fmt.percent.format(gap.localCoverage)}
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {localized(locale, gap.insight)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={t("opportunities.title")} subtitle={t("opportunities.subtitle")}>
          {data.localizationOpportunities.length === 0 ? (
            <EmptyCopy>{t("empty.opportunities")}</EmptyCopy>
          ) : (
            <div className="flex flex-col gap-3">
              {data.localizationOpportunities.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                    <div className="text-sm font-semibold">{fmt.integer.format(index + 1)}</div>
                    <div>
                      <h3 className="text-sm font-semibold">
                        {localized(locale, item.industry)}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {localized(locale, item.recommendedAction)}
                      </p>
                    </div>
                    <div className="text-start md:text-end">
                      <div className="text-sm font-semibold">
                        {fmt.currency(item.opportunityValue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {localized(locale, item.recommendedIndustrialCity)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-14 shrink-0 text-sm font-semibold">
                      {fmt.integer.format(item.opportunityScore)}
                    </div>
                    <Progress value={item.opportunityScore / 100} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Panel title={t("matrix.title")} subtitle={t("matrix.subtitle")}>
        {sortedMatrix.length === 0 ? (
          <EmptyCopy>{t("empty.matrix")}</EmptyCopy>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <SortableHeader
                      active={sortKey === "productCategory"}
                      direction={sortDirection}
                      onClick={() => sort("productCategory")}
                      label={t("matrix.columns.productCategory")}
                    />
                    <SortableHeader
                      active={sortKey === "sector"}
                      direction={sortDirection}
                      onClick={() => sort("sector")}
                      label={t("matrix.columns.sector")}
                    />
                    <th className="px-4 py-3 text-start font-medium">
                      {t("matrix.columns.exported")}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {t("matrix.columns.manufacturedLocally")}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {t("matrix.columns.imported")}
                    </th>
                    <SortableHeader
                      active={sortKey === "gapStatus"}
                      direction={sortDirection}
                      onClick={() => sort("gapStatus")}
                      label={t("matrix.columns.gapStatus")}
                    />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {pagedMatrix.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-medium">
                        {localized(locale, row.productCategory)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {localized(locale, row.sector)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusDot active={row.exported} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusDot active={row.manufacturedLocally} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusDot active={row.imported} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                            gapStatusTone(row.gapStatus)
                          )}
                        >
                          {t(`gapStatus.${row.gapStatus}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {t("matrix.page", {
                  current: fmt.integer.format(page + 1),
                  total: fmt.integer.format(pageCount),
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                >
                  {t("actions.previous")}
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                >
                  {t("actions.next")}
                </Button>
              </div>
            </div>
          </>
        )}
      </Panel>

      <Panel title={t("engine.title")} subtitle={t("engine.subtitle")}>
        {data.opportunities.length === 0 ? (
          <EmptyCopy>{t("empty.engine")}</EmptyCopy>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t("engine.rank")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("engine.industry")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("engine.score")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("engine.reason")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {data.opportunities.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">
                      {fmt.integer.format(index + 1)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {localized(locale, item.industry)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-40 items-center gap-3">
                        <span className="w-10 shrink-0 font-semibold">
                          {fmt.integer.format(item.opportunityScore)}
                        </span>
                        <Progress value={item.opportunityScore / 100} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {localized(locale, item.reason)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {data.usesMockAdapter && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          {localized(locale, data.sourceNote)}
        </div>
      )}
      </div>
    </div>
  );

  function sort(key: SortKey) {
    setPage(0);
    if (key === sortKey) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  }
}

function Panel({
  title,
  subtitle,
  children,
  contentClassName,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className={cn("flex flex-col gap-4", contentClassName)}>{children}</div>
    </section>
  );
}

function Gauge({
  value,
  label,
}: {
  value: number | null;
  label: string;
}) {
  const size = 140;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const hasValue = value !== null && Number.isFinite(value);
  const clamped = hasValue ? Math.max(0, Math.min(1, value)) : 0;
  const dashOffset = circumference * (1 - clamped);
  const percent = Math.round(clamped * 100);

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div
        className="relative flex h-[8.75rem] w-[8.75rem] items-center justify-center"
        role="img"
        aria-label={
          hasValue ? `${label}: ${percent}%` : `${label}: unavailable`
        }
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className="fill-none stroke-muted-foreground/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={cn(
              "fill-none transition-[stroke-dashoffset] duration-500 ease-out",
              hasValue ? "stroke-emerald-500" : "stroke-muted-foreground/30"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-3xl font-semibold tabular-nums tracking-tight">
            {hasValue ? `${percent}%` : "—"}
          </div>
        </div>
      </div>
      <div className="max-w-[9rem] text-center text-xs font-medium text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  change,
}: {
  title: string;
  value: string;
  detail: string;
  change?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{detail}</div>
      {change ? <div className="mt-1 text-xs text-emerald-600">{change}</div> : null}
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-foreground/75"
        style={{ width: `${Math.max(4, Math.min(100, value * 100))}%` }}
      />
    </div>
  );
}

function EmptyCopy({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

function SortableHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 text-start font-medium">
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5">
        {label}
        {active ? (
          direction === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          )
        ) : null}
      </button>
    </th>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
        active
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted text-muted-foreground"
      )}
      aria-label={active ? "yes" : "no"}
    >
      {active ? "Y" : "N"}
    </span>
  );
}
