"use client";

import { useTransition } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type {
  CountryOption,
  DemandFilters,
  Flow,
  PeriodOption,
} from "@/lib/customs/demand";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useDemandFormat } from "@/components/demand/format";
import { CountryPicker } from "./country-picker";

export function FilterBar({
  locale,
  filters,
  periods,
  countries,
}: {
  locale: Locale;
  filters: DemandFilters;
  periods: PeriodOption[];
  countries: CountryOption[];
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  /** Filters live in the URL so a view can be shared or bookmarked. */
  const apply = (next: Partial<DemandFilters>) => {
    const merged = { ...filters, ...next };
    // Preserve unrelated page params (e.g. map geography on Gap Analysis).
    const params = new URLSearchParams(searchParams.toString());
    params.delete("period");
    params.delete("country");
    params.delete("flow");
    if (merged.period !== "all") params.set("period", merged.period);
    if (merged.country) params.set("country", merged.country);
    if (merged.flow !== "import") params.set("flow", merged.flow);

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const periodLabel = (option: PeriodOption) => {
    if (option.kind === "all") return t("periodAll");
    if (option.kind === "ttm") return t("periodTtm");
    if (option.partial) {
      return t("periodPartialYear", {
        year: fmt.year(option.year ?? 0),
        from: fmt.monthName(option.fromMonth),
        to: fmt.monthName(option.toMonth),
      });
    }
    return fmt.year(option.year ?? 0);
  };

  const flows: Array<{ id: Flow; label: string; icon: typeof ArrowDownLeft }> = [
    { id: "import", label: t("flowImport"), icon: ArrowDownLeft },
    { id: "export", label: t("flowExport"), icon: ArrowUpRight },
  ];

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border/80 bg-card/85 p-3.5 backdrop-blur-md transition-opacity sm:p-4",
        pending && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{t("filtersTitle")}</h2>
        {pending && (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-label={t("loading")}
          />
        )}
      </div>

      <FilterGroup label={t("flowFilter")}>
        <div className="flex w-full rounded-full border border-border bg-background p-0.5">
          {flows.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => apply({ flow: id })}
              aria-pressed={filters.flow === id}
              className={cn(
                "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-sm font-medium transition-colors",
                filters.flow === id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label={t("countryFilter")}>
        <CountryPicker
          locale={locale}
          options={countries}
          value={filters.country}
          onChange={(code) => apply({ country: code })}
          fullWidth
        />
      </FilterGroup>

      <FilterGroup label={t("periodFilter")}>
        <div className="flex flex-col gap-1.5">
          {periods.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => apply({ period: option.id })}
              aria-pressed={filters.period === option.id}
              className={cn(
                "h-8 w-full rounded-lg border px-3 text-start text-sm font-medium transition-colors",
                filters.period === option.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {periodLabel(option)}
            </button>
          ))}
        </div>
      </FilterGroup>
    </section>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
