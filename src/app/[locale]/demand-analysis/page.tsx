import { getTranslations, setRequestLocale } from "next-intl/server";
import { DemandDashboard } from "@/components/demand/demand-dashboard";
import { PageFooter } from "@/components/layout/page-footer";
import { PageHero } from "@/components/layout/page-hero";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import type { Locale } from "@/i18n/routing";
import { loadDemand } from "@/lib/customs/demand";

export default async function DemandAnalysis({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const single = (key: string) => {
    const value = query[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const t = await getTranslations("DemandPage");
  const data = loadDemand({
    period: single("period"),
    country: single("country"),
    flow: single("flow"),
  });
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US");

  return (
    <PageShell>
      <SiteHeader brand={t("brand")} linkHome />

      <PageHero
        backLabel={t("backToIntro")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <DemandDashboard locale={locale} data={data} />

      <PageFooter>
        {t("sourceNote", { count: nf.format(data.recordCount) })}
      </PageFooter>
    </PageShell>
  );
}
