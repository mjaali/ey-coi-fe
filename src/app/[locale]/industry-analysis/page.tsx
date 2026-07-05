import { use } from "react";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PageFooter } from "@/components/layout/page-footer";
import { PageHero } from "@/components/layout/page-hero";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { StatCard } from "@/components/layout/stat-card";
import type { Locale } from "@/i18n/routing";
import {
  industrySummary as summary,
  type Industry,
} from "@/data/industry-summary";

const totalCities = summary.totals.cities;

const maxShare = summary.top[0]?.share ?? 1;

export default function IndustryAnalysis({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("IndustriesPage");
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US");
  const pf = new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  });

  const name = (industry: Industry): string =>
    industry.name[locale] ?? industry.name.en;

  const stats = [
    { label: t("statFactories"), value: nf.format(summary.totals.factories) },
    { label: t("statSectors"), value: nf.format(summary.totals.sectors) },
    { label: t("statCities"), value: nf.format(summary.totals.cities) },
    {
      label: t("statNetwork"),
      value: `${nf.format(summary.totals.networkKm)} ${t("unitKm")}`,
    },
  ];

  return (
    <PageShell>
      <SiteHeader brand={t("brand")} linkHome />

      <PageHero
        backLabel={t("backToIntro")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RankPanel
          title={t("topTitle")}
          subtitle={t("topSubtitle")}
          accent="top"
        >
          {summary.top.map((industry, i) => (
            <IndustryRow
              key={industry.code}
              rank={i + 1}
              label={name(industry)}
              count={nf.format(industry.count)}
              share={pf.format(industry.share)}
              width={(industry.share / maxShare) * 100}
              coverage={t("coverageLabel", {
                cities: nf.format(industry.cities),
                total: nf.format(totalCities),
              })}
              coverageCaption={t("coverageCaption")}
              coverageWidth={industry.coverage * 100}
              factoriesLabel={t("factoriesLabel")}
              shareLabel={t("shareLabel")}
              accent="top"
            />
          ))}
        </RankPanel>

        <RankPanel
          title={t("bottomTitle")}
          subtitle={t("bottomSubtitle")}
          accent="bottom"
        >
          {summary.bottom.map((industry, i) => (
            <IndustryRow
              key={industry.code}
              rank={i + 1}
              label={name(industry)}
              count={nf.format(industry.count)}
              share={pf.format(industry.share)}
              width={(industry.share / maxShare) * 100}
              coverage={t("coverageLabel", {
                cities: nf.format(industry.cities),
                total: nf.format(totalCities),
              })}
              coverageCaption={t("coverageCaption")}
              coverageWidth={industry.coverage * 100}
              factoriesLabel={t("factoriesLabel")}
              shareLabel={t("shareLabel")}
              accent="bottom"
            />
          ))}
        </RankPanel>
      </section>

      <PageFooter>{t("sourceNote")}</PageFooter>
    </PageShell>
  );
}

function RankPanel({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  accent: "top" | "bottom";
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span
          className={
            accent === "top"
              ? "h-2.5 w-2.5 rounded-full bg-emerald-500"
              : "h-2.5 w-2.5 rounded-full bg-amber-500"
          }
        />
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function IndustryRow({
  rank,
  label,
  count,
  share,
  width,
  coverage,
  coverageCaption,
  coverageWidth,
  factoriesLabel,
  shareLabel,
  accent,
}: {
  rank: number;
  label: string;
  count: string;
  share: string;
  width: number;
  coverage: string;
  coverageCaption: string;
  coverageWidth: number;
  factoriesLabel: string;
  shareLabel: string;
  accent: "top" | "bottom";
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
            {rank}
          </span>
          <span className="font-medium">{label}</span>
        </div>
        <div className="text-end">
          <span className="font-semibold">{count}</span>
          <span className="text-sm text-muted-foreground"> {factoriesLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={
              accent === "top"
                ? "h-full rounded-full bg-emerald-500"
                : "h-full rounded-full bg-amber-500"
            }
            style={{ width: `${Math.max(width, 4)}%` }}
          />
        </div>
        <span className="w-24 shrink-0 text-end text-sm text-muted-foreground">
          {share} {shareLabel}
        </span>
      </div>
      <div className="flex items-center gap-2 ps-10 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="font-medium text-foreground/70">{coverage}</span>
        <span>·</span>
        <span>{coverageCaption}</span>
        <span
          className="ms-1 h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          aria-hidden
        >
          <span
            className="block h-full rounded-full bg-foreground/25"
            style={{ width: `${Math.max(coverageWidth, 4)}%` }}
          />
        </span>
      </div>
    </div>
  );
}
