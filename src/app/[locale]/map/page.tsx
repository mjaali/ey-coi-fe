import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { IndustrialMap } from "@/components/map/industrial-map";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { industrySummary } from "@/data/industry-summary";
import { cn } from "@/lib/utils";

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
    <div className="app-surface min-h-full flex-1">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 sm:px-10 sm:py-16">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
              M
            </span>
            <span className="text-lg font-semibold tracking-tight">
              {t("brand")}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 rtl:-scale-x-100" aria-hidden />
            {t("backToIntro")}
          </Link>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </section>

        <IndustrialMap
          locale={locale}
          className="h-[min(70vh,560px)] w-full"
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

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          {t("sourceNote")}
        </footer>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
