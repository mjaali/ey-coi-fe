import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PageFooter } from "@/components/layout/page-footer";
import { PageHero } from "@/components/layout/page-hero";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { StatCard } from "@/components/layout/stat-card";
import { IndustrialMap } from "@/components/map/industrial-map";
import type { Locale } from "@/i18n/routing";
import { industrySummary } from "@/data/industry-summary";

export default function MapPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("MapPage");
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US");

  return (
    <PageShell>
      <SiteHeader brand={t("brand")} linkHome />

      <PageHero
        backLabel={t("backToIntro")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <IndustrialMap
        locale={locale}
        className="h-[min(55vh,28rem)] w-full"
        factoriesLabel={t("factoriesLabel")}
        tokenMissingMessage={t("tokenMissing")}
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label={t("statCities")}
          value={nf.format(industrySummary.totals.cities)}
        />
        <StatCard
          label={t("statFactories")}
          value={nf.format(industrySummary.totals.factories)}
        />
        <StatCard
          label={t("statNetwork")}
          value={`${nf.format(industrySummary.totals.networkKm)} ${t("unitKm")}`}
          className="col-span-2 sm:col-span-1"
        />
      </section>

      <PageFooter>{t("sourceNote")}</PageFooter>
    </PageShell>
  );
}
