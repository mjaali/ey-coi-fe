import { getTranslations, setRequestLocale } from "next-intl/server";
import { MetricModule } from "@/components/layout/metric-module";
import { PageFooter } from "@/components/layout/page-footer";
import { PageShell } from "@/components/layout/page-shell";
import { SegmentedMeter } from "@/components/layout/segmented-meter";
import { SiteHeader } from "@/components/layout/site-header";
import { StatusBadge } from "@/components/layout/status-badge";
import { industrySummary } from "@/data/industry-summary";
import type { Locale } from "@/i18n/routing";
import { loadCommandCenter } from "@/lib/command-center/data";
import { loadDemand } from "@/lib/customs/demand";
import { surfaceClasses } from "@/theme";
import { cn } from "@/lib/utils";

function formatters(locale: Locale) {
  const tag = locale === "ar" ? "ar-u-nu-latn" : "en-US";
  const integer = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
  const percent = new Intl.NumberFormat(tag, {
    style: "percent",
    maximumFractionDigits: 0,
  });
  const compact = new Intl.NumberFormat(tag, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const currency = (value: number | null) =>
    value === null ? "—" : `SAR ${compact.format(value)}`;
  const weight = (kg: number) => {
    const tonnes = kg / 1000;
    const abs = Math.abs(tonnes);
    if (abs >= 1_000_000) return `${decimal.format(tonnes / 1_000_000)} Mt`;
    if (abs >= 1_000) return `${decimal.format(tonnes / 1_000)} kt`;
    return `${decimal.format(tonnes)} t`;
  };
  return { integer, decimal, percent, compact, currency, weight };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("IntroPage");
  const fmt = formatters(locale);

  const gap = loadCommandCenter({});
  const demand = loadDemand({ flow: "import" });

  const localizationScore =
    gap.kpis.find((k) => k.label === "localizationScore")?.value ?? null;
  const manufacturingGaps =
    gap.kpis.find((k) => k.label === "manufacturingGaps")?.value ?? null;
  const priorityOps =
    gap.kpis.find((k) => k.label === "priorityOpportunities")?.value ?? null;
  const exportValue =
    gap.kpis.find((k) => k.label === "totalExportValue")?.value ?? null;

  const readiness =
    localizationScore === null
      ? 0.72
      : Math.min(1, Math.max(0, localizationScore / 100));

  const topIndustry = industrySummary.top[0];
  const topIndustryName =
    locale === "ar"
      ? (topIndustry?.name.ar ?? topIndustry?.name.en ?? "—")
      : (topIndustry?.name.en ?? "—");

  const alerts = [
    {
      label: t("alerts.airframe"),
      status: t("status.nominal"),
      tone: "nominal" as const,
    },
    {
      label: t("alerts.sensors"),
      status:
        manufacturingGaps && manufacturingGaps > 0
          ? t("status.warn")
          : t("status.nominal"),
      tone:
        manufacturingGaps && manufacturingGaps > 0
          ? ("warn" as const)
          : ("nominal" as const),
    },
    {
      label: t("alerts.network"),
      status: t("status.nominal"),
      tone: "nominal" as const,
    },
  ];

  return (
    <PageShell gap="lg">
      <SiteHeader
        brand={t("brand")}
        missionId={t("missionId")}
        statusLabel={t("status.live")}
        activeHref="/"
      />

      <section className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <div className="flex flex-col gap-3">
          <div className={cn(surfaceClasses.glass, "p-4")}>
            <div className="hud-label text-primary">{t("eyebrow")}</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <SegmentedMeter
            label={t("readiness.label")}
            valueLabel={fmt.percent.format(readiness)}
            ratio={readiness}
          />

          <div className={cn(surfaceClasses.glass, "p-4")}>
            <div className="hud-label">{t("alerts.title")}</div>
            <ul className="mt-3 space-y-2.5">
              {alerts.map((alert) => (
                <li
                  key={alert.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        alert.tone === "warn" ? "bg-warning" : "bg-modon-green"
                      )}
                      aria-hidden
                    />
                    {alert.label}
                  </span>
                  <StatusBadge label={alert.status} tone={alert.tone} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={cn(
            surfaceClasses.glass,
            "relative overflow-hidden p-5 hud-scanline min-h-[16rem]"
          )}
        >
          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={t("hero.view")} tone="warn" />
              <StatusBadge label={t("status.live")} tone="nominal" />
            </div>
            <div>
              <div className="hud-label text-primary">{t("hero.kicker")}</div>
              <p className="mt-2 max-w-md text-lg font-medium leading-snug sm:text-xl">
                {t("hero.body")}
              </p>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                {t("hero.hint")}
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-2">
              <div className="rounded-md border border-border/60 bg-background/40 px-2.5 py-2">
                <dt className="hud-label">{t("hero.statFactories")}</dt>
                <dd className="mt-1 font-mono text-base font-semibold tabular-nums">
                  {fmt.integer.format(industrySummary.totals.factories)}
                </dd>
              </div>
              <div className="rounded-md border border-border/60 bg-background/40 px-2.5 py-2">
                <dt className="hud-label">{t("hero.statCities")}</dt>
                <dd className="mt-1 font-mono text-base font-semibold tabular-nums">
                  {fmt.integer.format(industrySummary.totals.cities)}
                </dd>
              </div>
              <div className="rounded-md border border-border/60 bg-background/40 px-2.5 py-2">
                <dt className="hud-label">{t("hero.statSectors")}</dt>
                <dd className="mt-1 font-mono text-base font-semibold tabular-nums">
                  {fmt.integer.format(industrySummary.totals.sectors)}
                </dd>
              </div>
            </dl>
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
          >
            <div className="absolute left-1/2 top-1/2 size-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-modon-green/25" />
            <div className="absolute left-1/2 top-1/2 size-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-modon-sky/20" />
            <div className="absolute left-[18%] top-[28%] size-2 rounded-full bg-modon-green shadow-[0_0_12px_var(--modon-green)]" />
            <div className="absolute right-[22%] top-[36%] size-1.5 rounded-full bg-warning shadow-[0_0_10px_var(--warning)]" />
            <div className="absolute bottom-[30%] left-[40%] size-1.5 rounded-full bg-modon-sky shadow-[0_0_10px_var(--modon-sky)]" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className={cn(surfaceClasses.glass, "p-4")}>
            <div className="hud-label">{t("signals.title")}</div>
            <div className="mt-3 space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("signals.export")}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {fmt.currency(exportValue)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("signals.importWeight")}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {fmt.weight(demand.headline.current.kg)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("signals.topSector")}
                </span>
                <span className="truncate text-end text-sm font-medium">
                  {topIndustryName}
                </span>
              </div>
            </div>
          </div>

          <div className={cn(surfaceClasses.glass, "grid grid-cols-3 gap-2 p-3")}>
            {[
              {
                label: t("signals.link"),
                value: t("status.strong"),
                tone: "nominal" as const,
              },
              {
                label: t("signals.latency"),
                value: "28ms",
                tone: "info" as const,
              },
              {
                label: t("signals.encrypt"),
                value: "AES-256",
                tone: "nominal" as const,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-border/60 bg-background/35 px-2 py-2"
              >
                <div className="hud-label truncate">{item.label}</div>
                <div className="mt-1 font-mono text-xs font-semibold">
                  {item.value}
                </div>
                <StatusBadge
                  label={
                    item.tone === "info" ? t("status.live") : t("status.nominal")
                  }
                  tone={item.tone}
                  className="mt-2"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <MetricModule
          title={t("modules.gap.title")}
          value={
            localizationScore === null
              ? "—"
              : fmt.integer.format(localizationScore)
          }
          unit="/100"
          description={t("modules.gap.description")}
          statusLabel={t("status.nominal")}
          statusTone="nominal"
          href="/gap-analysis"
          exploreLabel={t("features.explore")}
          stats={[
            {
              label: t("modules.gap.gaps"),
              value: fmt.integer.format(manufacturingGaps ?? 0),
            },
            {
              label: t("modules.gap.opportunities"),
              value: fmt.integer.format(priorityOps ?? 0),
            },
            {
              label: t("modules.gap.export"),
              value: fmt.currency(exportValue),
            },
            {
              label: t("modules.gap.selfSufficiency"),
              value:
                gap.pulse.selfSufficiency === null
                  ? "—"
                  : fmt.percent.format(gap.pulse.selfSufficiency),
            },
          ]}
        />

        <MetricModule
          title={t("modules.industry.title")}
          value={fmt.integer.format(industrySummary.totals.factories)}
          description={t("modules.industry.description")}
          statusLabel={t("status.nominal")}
          statusTone="nominal"
          href="/industry-analysis"
          exploreLabel={t("features.explore")}
          stats={[
            {
              label: t("modules.industry.sectors"),
              value: fmt.integer.format(industrySummary.totals.sectors),
            },
            {
              label: t("modules.industry.cities"),
              value: fmt.integer.format(industrySummary.totals.cities),
            },
            {
              label: t("modules.industry.top"),
              value: topIndustry
                ? fmt.percent.format(topIndustry.share)
                : "—",
            },
            {
              label: t("modules.industry.leader"),
              value: topIndustryName,
            },
          ]}
        />

        <MetricModule
          title={t("modules.cities.title")}
          value={fmt.integer.format(industrySummary.totals.cities)}
          description={t("modules.cities.description")}
          statusLabel={t("status.nominal")}
          statusTone="nominal"
          href="/map"
          exploreLabel={t("features.explore")}
          stats={[
            {
              label: t("modules.cities.factories"),
              value: fmt.integer.format(industrySummary.totals.factories),
            },
            {
              label: t("modules.cities.network"),
              value: `${fmt.decimal.format(industrySummary.totals.networkKm)} km`,
            },
            {
              label: t("modules.cities.avg"),
              value: fmt.integer.format(
                Math.round(
                  industrySummary.totals.factories /
                    industrySummary.totals.cities
                )
              ),
            },
            {
              label: t("modules.cities.coverage"),
              value: fmt.percent.format(
                (topIndustry?.coverage ?? 0)
              ),
            },
          ]}
        />

        <MetricModule
          title={t("modules.demand.title")}
          value={fmt.weight(demand.headline.current.kg)}
          description={t("modules.demand.description")}
          statusLabel={t("status.live")}
          statusTone="info"
          href="/demand-analysis"
          exploreLabel={t("features.explore")}
          className="md:col-span-2 xl:col-span-1"
          stats={[
            {
              label: t("modules.demand.declarations"),
              value: fmt.integer.format(demand.headline.current.declarations),
            },
            {
              label: t("modules.demand.partners"),
              value: fmt.integer.format(demand.activeCountries),
            },
            {
              label: t("modules.demand.cities"),
              value: fmt.integer.format(demand.activeCities),
            },
            {
              label: t("modules.demand.importers"),
              value: fmt.integer.format(demand.importers.current),
            },
          ]}
        />

        <MetricModule
          title={t("modules.network.title")}
          value={`${fmt.decimal.format(industrySummary.totals.networkKm)}`}
          unit="km"
          description={t("modules.network.description")}
          statusLabel={t("status.standby")}
          statusTone="neutral"
          href={null}
          className="md:col-span-2 xl:col-span-2"
          stats={[
            {
              label: t("modules.network.nodes"),
              value: fmt.integer.format(industrySummary.totals.cities),
            },
            {
              label: t("modules.network.sectors"),
              value: fmt.integer.format(industrySummary.totals.sectors),
            },
            {
              label: t("modules.network.status"),
              value: t("status.standby"),
            },
            {
              label: t("modules.network.next"),
              value: t("modules.network.nextValue"),
            },
          ]}
        />
      </section>

      <PageFooter>{t("footer")}</PageFooter>
    </PageShell>
  );
}
