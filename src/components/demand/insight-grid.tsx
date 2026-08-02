"use client";

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarClock,
  Layers,
  Package,
  Scale,
  Ship,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { Insight, Tone } from "@/lib/customs/demand";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { toneClasses } from "@/theme";
import { useDemandFormat } from "./format";

const TONE_STYLE: Record<Tone, string> = {
  positive: toneClasses.positive,
  negative: toneClasses.negative,
  warning: toneClasses.warning,
  neutral: toneClasses.neutral,
};

export function InsightGrid({
  locale,
  insights,
}: {
  locale: Locale;
  insights: Insight[];
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);

  const cards = insights.map((insight, index) => {
    const rendered = render(insight);
    if (!rendered) return null;
    return (
      <li
        key={`${insight.kind}-${index}`}
        className="flex gap-2.5 rounded-xl border border-border bg-card p-3"
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            TONE_STYLE[insight.tone]
          )}
        >
          <rendered.icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {rendered.kicker}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {rendered.body}
          </p>
        </div>
      </li>
    );
  });

  function render(
    insight: Insight
  ): { icon: LucideIcon; kicker: string; body: string } | null {
    switch (insight.kind) {
      case "countryRank":
        return {
          icon: Trophy,
          kicker: t("insightRankKicker"),
          body: t("insightRankBody", {
            name: fmt.name(insight.name),
            rank: fmt.integer.format(insight.rank),
            total: fmt.integer.format(insight.total),
            share: fmt.percent1.format(insight.share),
          }),
        };

      case "concentration": {
        if (!insight.leader) return null;
        const body =
          insight.basis === "country"
            ? t("insightConcentrationCountryBody", {
                topN: fmt.integer.format(insight.topN),
                topShare: fmt.percent.format(insight.topShare),
                leader: fmt.name(insight.leader),
                leaderShare: fmt.percent.format(insight.leaderShare),
              })
            : t("insightConcentrationChapterBody", {
                topN: fmt.integer.format(insight.topN),
                topShare: fmt.percent.format(insight.topShare),
                leader: fmt.name(insight.leader),
                leaderShare: fmt.percent.format(insight.leaderShare),
              });
        return {
          icon: Target,
          kicker: t(`insightConcentrationKicker.${insight.band}`),
          body,
        };
      }

      case "momentum":
        return {
          icon: TrendingUp,
          kicker: t("insightMomentumKicker"),
          body: t("insightMomentumBody", {
            name: fmt.name(insight.name),
            delta: fmt.percent1.format(Math.abs(insight.deltaKg)),
            weight: fmt.weight(insight.kg),
          }),
        };

      case "decline":
        return {
          icon: TrendingDown,
          kicker: t("insightDeclineKicker"),
          body: t("insightDeclineBody", {
            name: fmt.name(insight.name),
            delta: fmt.percent1.format(Math.abs(insight.deltaKg)),
            weight: fmt.weight(insight.kg),
          }),
        };

      case "peak":
        return {
          icon: CalendarClock,
          kicker: t("insightPeakKicker"),
          body: t("insightPeakBody", {
            month: fmt.monthName(insight.month, true),
            year: fmt.year(insight.year),
            weight: fmt.weight(insight.kg),
          }),
        };

      case "balance":
        return {
          icon: Scale,
          kicker: t("insightBalanceKicker"),
          body: t("insightBalanceBody", {
            imports: fmt.weight(insight.importKg),
            exports: fmt.weight(insight.exportKg),
            coverage: fmt.percent.format(insight.coverage),
            net: fmt.weight(Math.abs(insight.netKg)),
            direction: insight.netKg >= 0 ? "surplus" : "deficit",
          }),
        };

      case "modal":
        return {
          icon: Ship,
          kicker: t("insightModalKicker"),
          body: t("insightModalBody", {
            mode: t(`mode.${insight.mode}`),
            share: fmt.percent.format(insight.share),
          }),
        };

      case "shipment":
        return {
          icon: Package,
          kicker: t("insightShipmentKicker"),
          body: t("insightShipmentBody", {
            avg: fmt.decimal.format(insight.avgKg / 1000),
            benchmark: fmt.decimal.format(insight.benchmarkKg / 1000),
            comparison: insight.ratio >= 1 ? "heavier" : "lighter",
            factor: fmt.decimal.format(
              insight.ratio >= 1 ? insight.ratio : 1 / insight.ratio
            ),
          }),
        };

      case "product":
        return {
          icon: Layers,
          kicker: t("insightProductKicker"),
          body: t("insightProductBody", {
            name: fmt.name(insight.name),
            share: fmt.percent.format(insight.share),
            weight: fmt.weight(insight.kg),
          }),
        };

      case "importers":
        return {
          icon: Building2,
          kicker: t("insightImportersKicker"),
          body:
            insight.delta === null
              ? t("insightImportersBody", {
                  count: fmt.integer.format(insight.count),
                })
              : t("insightImportersBodyDelta", {
                  count: fmt.integer.format(insight.count),
                  delta: fmt.signedPercent.format(insight.delta),
                }),
        };
    }
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards}</ul>
  );
}
