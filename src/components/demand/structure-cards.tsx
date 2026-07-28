"use client";

import { Plane, Ship, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  Concentration,
  Measure,
  ModeSplit,
} from "@/lib/customs/demand";
import type { PortMode } from "@/lib/customs/dictionaries";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useDemandFormat } from "./format";

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

const BAND_STYLE: Record<Concentration["band"], string> = {
  low: "text-emerald-600 dark:text-emerald-400",
  moderate: "text-amber-600 dark:text-amber-400",
  high: "text-rose-600 dark:text-rose-400",
};

/** HHI runs 0–10,000; the gauge is clamped to 5,000 to keep it readable. */
const HHI_GAUGE_MAX = 5000;

export function ConcentrationCard({
  locale,
  concentration,
}: {
  locale: Locale;
  concentration: Concentration;
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const fill = Math.min(concentration.hhi / HHI_GAUGE_MAX, 1) * 100;

  return (
    <Card
      title={t("concentrationTitle")}
      subtitle={
        concentration.basis === "country"
          ? t("concentrationSubtitleCountry")
          : t("concentrationSubtitleChapter")
      }
    >
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">
          {fmt.integer.format(concentration.hhi)}
        </span>
        <span
          className={cn(
            "text-sm font-medium",
            BAND_STYLE[concentration.band]
          )}
        >
          {t(`concentrationBand.${concentration.band}`)}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="relative h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              concentration.band === "low"
                ? "bg-emerald-500"
                : concentration.band === "moderate"
                  ? "bg-amber-500"
                  : "bg-rose-500"
            )}
            style={{ width: `${fill}%` }}
          />
          {/* Standard HHI thresholds at 1,500 and 2,500. */}
          {[1500, 2500].map((mark) => (
            <span
              key={mark}
              className="absolute top-0 h-full w-px bg-background/80"
              style={{ insetInlineStart: `${(mark / HHI_GAUGE_MAX) * 100}%` }}
              aria-hidden
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{t("concentrationScaleLow")}</span>
          <span>{t("concentrationScaleHigh")}</span>
        </div>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">
            {t("concentrationTopShare", {
              count: fmt.integer.format(concentration.topN),
            })}
          </dt>
          <dd className="font-semibold tabular-nums">
            {fmt.percent.format(concentration.topShare)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="truncate text-muted-foreground">
            {concentration.leader ? fmt.name(concentration.leader) : "—"}
          </dt>
          <dd className="font-semibold tabular-nums">
            {fmt.percent.format(concentration.leaderShare)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">
            {concentration.basis === "country"
              ? t("concentrationMembersCountry")
              : t("concentrationMembersChapter")}
          </dt>
          <dd className="font-semibold tabular-nums">
            {fmt.integer.format(concentration.members)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

export function TradeBalanceCard({
  locale,
  imports,
  exports,
}: {
  locale: Locale;
  imports: Measure;
  exports: Measure;
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);

  const total = imports.kg + exports.kg;
  const importShare = total > 0 ? imports.kg / total : 0;
  const net = exports.kg - imports.kg;
  const coverage = imports.kg > 0 ? exports.kg / imports.kg : 0;

  return (
    <Card title={t("balanceTitle")} subtitle={t("balanceSubtitle")}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">
          {fmt.weight(Math.abs(net))}
        </span>
        <span
          className={cn(
            "text-sm font-medium",
            net >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
          )}
        >
          {net >= 0 ? t("balanceSurplus") : t("balanceDeficit")}
        </span>
      </div>

      <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="bg-sky-500"
          style={{ width: `${importShare * 100}%` }}
          aria-hidden
        />
        <div className="flex-1 bg-violet-500" aria-hidden />
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <Legend
          color="bg-sky-500"
          label={t("flowImport")}
          value={fmt.weight(imports.kg)}
          hint={fmt.percent.format(importShare)}
        />
        <Legend
          color="bg-violet-500"
          label={t("flowExport")}
          value={fmt.weight(exports.kg)}
          hint={fmt.percent.format(1 - importShare)}
        />
        <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2">
          <dt className="text-muted-foreground">{t("balanceCoverage")}</dt>
          <dd className="font-semibold tabular-nums">
            {fmt.percent.format(coverage)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

const MODE_ICON: Record<PortMode, typeof Ship> = {
  sea: Ship,
  land: Truck,
  air: Plane,
};

const MODE_COLOR: Record<PortMode, string> = {
  sea: "bg-sky-500",
  land: "bg-amber-500",
  air: "bg-emerald-500",
};

export function ModeSplitCard({
  locale,
  modes,
}: {
  locale: Locale;
  modes: ModeSplit[];
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const leading = [...modes].sort((a, b) => b.share - a.share)[0];

  return (
    <Card title={t("modeTitle")} subtitle={t("modeSubtitle")}>
      {leading ? (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">
              {fmt.percent.format(leading.share)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {t(`mode.${leading.mode}`)}
            </span>
          </div>

          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
            {modes.map((mode) => (
              <div
                key={mode.mode}
                className={cn("first:rounded-s-full last:rounded-e-full", MODE_COLOR[mode.mode])}
                style={{ width: `${Math.max(mode.share * 100, 1)}%` }}
                aria-hidden
              />
            ))}
          </div>

          <dl className="flex flex-col gap-2 text-sm">
            {modes.map((mode) => {
              const Icon = MODE_ICON[mode.mode];
              return (
                <div
                  key={mode.mode}
                  className="flex items-baseline justify-between gap-3"
                >
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {t(`mode.${mode.mode}`)}
                  </dt>
                  <dd className="flex items-baseline gap-2">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {fmt.percent.format(mode.share)}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {fmt.weight(mode.kg)}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t("emptyState")}
        </p>
      )}
    </Card>
  );
}

export function ShipmentCard({
  locale,
  avgKg,
  declarations,
  totalKg,
  partners,
  cities,
}: {
  locale: Locale;
  avgKg: number;
  declarations: number;
  totalKg: number;
  partners: number;
  cities: number;
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);

  return (
    <Card title={t("shipmentTitle")} subtitle={t("shipmentSubtitle")}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">
          {t("weightT", { value: fmt.decimal.format(avgKg / 1000) })}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {t("shipmentPerDeclaration")}
        </span>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">{t("statDeclarations")}</dt>
          <dd className="font-semibold tabular-nums">
            {fmt.integer.format(declarations)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">{t("shipmentTotal")}</dt>
          <dd className="font-semibold tabular-nums">{fmt.weight(totalKg)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2">
          <dt className="text-muted-foreground">{t("shipmentReach")}</dt>
          <dd className="font-semibold tabular-nums">
            {t("shipmentReachValue", {
              partners: fmt.integer.format(partners),
              cities: fmt.integer.format(cities),
            })}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

function Legend({
  color,
  label,
  value,
  hint,
}: {
  color: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", color)} aria-hidden />
        {label}
      </dt>
      <dd className="flex items-baseline gap-2">
        <span className="text-xs tabular-nums text-muted-foreground">{hint}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </dd>
    </div>
  );
}
