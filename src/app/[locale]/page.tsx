import { use } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Factory,
  MapPinned,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PageFooter } from "@/components/layout/page-footer";
import { PageShell } from "@/components/layout/page-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("IntroPage");

  const features = [
    {
      icon: Factory,
      key: "gapAnalysis" as const,
      href: "/gap-analysis",
    },
    { icon: BarChart3, key: "industries" as const, href: "/industry-analysis" },
    { icon: Building2, key: "cities" as const, href: "/map" },
    { icon: MapPinned, key: "network" as const, href: null },
    { icon: TrendingUp, key: "demand" as const, href: "/demand-analysis" },
  ];

  return (
    <PageShell gap="lg">
      <SiteHeader brand={t("brand")} />

      <section className="flex flex-col items-start gap-4 py-4 sm:py-8">
        <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {t("eyebrow")}
        </span>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/industry-analysis"
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            {t("cta")}
            <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, key, href }) => {
          const card = (
            <div className="flex h-full flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/20">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <h2 className="text-base font-semibold tracking-tight">
                {t(`features.${key}.title`)}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`features.${key}.description`)}
              </p>
              {href && (
                <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-foreground">
                  {t("features.explore")}
                  <ArrowRight
                    className="h-3.5 w-3.5 rtl:-scale-x-100"
                    aria-hidden
                  />
                </span>
              )}
            </div>
          );

          return href ? (
            <Link key={key} href={href} className="h-full">
              {card}
            </Link>
          ) : (
            <div key={key} className="h-full">
              {card}
            </div>
          );
        })}
      </section>

      <PageFooter>{t("footer")}</PageFooter>
    </PageShell>
  );
}
