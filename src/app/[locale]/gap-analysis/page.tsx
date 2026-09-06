import { getTranslations, setRequestLocale } from "next-intl/server";
import { CommandCenterDashboard } from "@/components/command-center/dashboard";
import { PageFooter } from "@/components/layout/page-footer";
import { PageHero } from "@/components/layout/page-hero";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import type { Locale } from "@/i18n/routing";
import { loadCommandCenter } from "@/lib/command-center/data";

export default async function GapAnalysisPage({
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

  const t = await getTranslations("GapAnalysisPage");
  const data = loadCommandCenter({
    period: single("period"),
    country: single("country"),
    flow: single("flow"),
    region: single("region"),
    industrialCity: single("industrialCity"),
  });

  return (
    <PageShell>
      <SiteHeader brand={t("brand")} linkHome activeHref="/gap-analysis" />

      <PageHero
        backLabel={t("backToIntro")}
        eyebrow="COI · GAP"
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <CommandCenterDashboard locale={locale} data={data} />

      <PageFooter>{t("sourceNote")}</PageFooter>
    </PageShell>
  );
}
