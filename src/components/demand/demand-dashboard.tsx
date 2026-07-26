"use client";

import { useCallback, useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { DemandData } from "@/lib/customs/demand";
import type { Locale } from "@/i18n/routing";
import { CountryProfileCard } from "./country-profile-card";
import { DeltaChip } from "./delta-chip";
import { DemandMap } from "./demand-map";
import { FilterBar } from "./filter-bar";
import { useDemandFormat } from "./format";
import { InsightGrid } from "./insight-grid";
import { RankPanel } from "./rank-panel";
import {
  ConcentrationCard,
  ModeSplitCard,
  TradeBalanceCard,
} from "./structure-cards";
import { TrendChart } from "./trend-chart";

export function DemandDashboard({
  locale,
  data,
}: {
  locale: Locale;
  data: DemandData;
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const { filters, headline, window: win, priorWindow } = data;
  const isImport = filters.flow === "import";

  const setCountry = useCallback(
    (code: string | null) => {
      const params = new URLSearchParams();
      if (filters.period !== "all") params.set("period", filters.period);
      if (code) params.set("country", code);
      if (filters.flow !== "import") params.set("flow", filters.flow);
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [filters.period, filters.flow, pathname, router]
  );

  const periodLabel = fmt.range(
    win.fromYear,
    win.fromMonth,
    win.toYear,
    win.toMonth
  );
  const priorLabel = priorWindow
    ? fmt.range(
        priorWindow.fromYear,
        priorWindow.fromMonth,
        priorWindow.toYear,
        priorWindow.toMonth
      )
    : null;

  const deltaLabel = (value: number | null) =>
    value === null ? "" : fmt.signedPercent.format(value);

  const stats = [
    {
      key: "weight",
      label: isImport ? t("statImportWeight") : t("statExportWeight"),
      value: fmt.weight(headline.current.kg),
      delta: headline.deltaKg,
    },
    {
      key: "declarations",
      label: t("statDeclarations"),
      value: fmt.integer.format(headline.current.declarations),
      delta: headline.deltaDeclarations,
    },
    {
      key: "shipment",
      label: t("statAvgShipment"),
      value: t("weightT", {
        value: fmt.decimal.format(data.avgShipmentKg / 1000),
      }),
      delta: null,
    },
    {
      key: "importers",
      label: isImport ? t("statImporters") : t("statExporters"),
      value: fmt.integer.format(data.importers.current),
      delta:
        data.importers.previous && data.importers.previous > 0
          ? (data.importers.current - data.importers.previous) /
            data.importers.previous
          : null,
    },
    // With a country selected, a network-wide partner count would read as if it
    // belonged to that country, so show its share of the network instead.
    data.countryProfile
      ? {
          key: "share",
          label: t("statNetworkShare"),
          value: fmt.percent1.format(data.countryProfile.share),
          delta: null,
        }
      : {
          key: "partners",
          label: isImport ? t("statOrigins") : t("statDestinations"),
          value: fmt.integer.format(data.activeCountries),
          delta: null,
        },
    {
      key: "cities",
      label: t("statCities"),
      value: fmt.integer.format(data.activeCities),
      delta: null,
    },
  ];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(15rem,17.5rem)_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <FilterBar
          locale={locale}
          filters={filters}
          periods={data.periods}
          countries={data.countries}
        />
      </aside>

      <div className="flex min-w-0 flex-col gap-12">
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              {periodLabel}
            </h2>
            <p className="text-sm text-muted-foreground">
              {priorLabel
                ? t("comparisonBasis", { period: priorLabel })
                : t("comparisonNone")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </div>
                <div>
                  <div className="text-xs leading-snug text-muted-foreground">
                    {stat.label}
                  </div>
                  <DeltaChip
                    size="xs"
                    className="mt-1.5"
                    value={stat.delta}
                    label={deltaLabel(stat.delta)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t("mapTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isImport ? t("mapSubtitleImport") : t("mapSubtitleExport")}
            </p>
          </div>
          <DemandMap
            locale={locale}
            cities={data.cities}
            className="h-[min(56vh,28rem)] w-full"
          />
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t("insightsTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("insightsSubtitle")}
            </p>
          </div>
          <InsightGrid locale={locale} insights={data.insights} />
        </section>

        {data.countryProfile && (
          <CountryProfileCard
            locale={locale}
            profile={data.countryProfile}
            periodLabel={periodLabel}
            onClear={() => setCountry(null)}
          />
        )}

        <TrendChart
          locale={locale}
          series={data.series}
          priorLabel={priorLabel}
          flow={filters.flow}
        />

        <section className="grid gap-4 lg:grid-cols-3">
          <ConcentrationCard
            locale={locale}
            concentration={data.concentration}
          />
          <TradeBalanceCard
            locale={locale}
            imports={data.importTotals}
            exports={data.exportTotals}
          />
          <ModeSplitCard locale={locale} modes={data.modeSplit} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <RankPanel
            locale={locale}
            title={isImport ? t("originsTitle") : t("destinationsTitle")}
            subtitle={
              isImport ? t("originsSubtitle") : t("destinationsSubtitle")
            }
            rows={data.countriesRank}
            accent="violet"
            activeCode={filters.country}
            onSelect={setCountry}
          />
          <RankPanel
            locale={locale}
            title={t("citiesTitle")}
            subtitle={
              isImport ? t("citiesSubtitle") : t("citiesSubtitleExport")
            }
            rows={data.cities.slice(0, 12)}
            accent="sky"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <RankPanel
            locale={locale}
            title={t("hsTitle")}
            subtitle={t("hsSubtitle")}
            rows={data.chapters}
            accent="emerald"
          />
          <RankPanel
            locale={locale}
            title={isImport ? t("portsTitle") : t("portsTitleExport")}
            subtitle={
              isImport ? t("portsSubtitle") : t("portsSubtitleExport")
            }
            rows={data.ports}
            accent="amber"
          />
        </section>
      </div>
    </div>
  );
}
