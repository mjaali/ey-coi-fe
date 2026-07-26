"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(nextLocale: Locale) {
    const query = window.location.search.slice(1);
    router.replace(query ? `${pathname}?${query}` : pathname, {
      locale: nextLocale,
      scroll: false,
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex items-center gap-1 rounded-full border border-border p-1"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-colors",
            l === locale
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}
