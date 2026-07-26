"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Bilingual } from "@/lib/customs/dictionaries";
import type { Locale } from "@/i18n/routing";

export type DemandFormat = ReturnType<typeof useDemandFormat>;

export function useDemandFormat(locale: Locale) {
  const t = useTranslations("DemandPage");

  return useMemo(() => {
    // The numbering system is pinned because Node resolves "ar" to Latin digits
    // while some browsers pick Arabic-Indic, which would break hydration.
    // Latin digits are also the norm in Saudi business reporting.
    const tag = locale === "ar" ? "ar-u-nu-latn" : "en-US";

    const decimal = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
    const integer = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
    const percent = new Intl.NumberFormat(tag, {
      style: "percent",
      maximumFractionDigits: 0,
    });
    const percent1 = new Intl.NumberFormat(tag, {
      style: "percent",
      maximumFractionDigits: 1,
    });
    const signedPercent = new Intl.NumberFormat(tag, {
      style: "percent",
      maximumFractionDigits: 1,
      signDisplay: "exceptZero",
    });
    const monthShort = new Intl.DateTimeFormat(tag, { month: "short" });
    const monthLong = new Intl.DateTimeFormat(tag, { month: "long" });
    /** Years must never carry a thousands separator. */
    const yearFormat = new Intl.NumberFormat(tag, { useGrouping: false });

    /** Renders kilograms at the largest sensible unit (t / kt / Mt). */
    const weight = (kg: number) => {
      const tonnes = kg / 1000;
      const abs = Math.abs(tonnes);
      if (abs >= 1_000_000) {
        return t("weightMt", { value: decimal.format(tonnes / 1_000_000) });
      }
      if (abs >= 1_000) {
        return t("weightKt", { value: decimal.format(tonnes / 1_000) });
      }
      return t("weightT", { value: decimal.format(tonnes) });
    };

    const monthName = (month: number, long = false) =>
      (long ? monthLong : monthShort).format(new Date(2020, month - 1, 1));

    const year = (value: number) => yearFormat.format(value);

    /** e.g. "Jan–May 2026" or "Jun 2025 – May 2026". */
    const range = (
      fromYear: number,
      fromMonth: number,
      toYear: number,
      toMonth: number
    ) => {
      if (fromYear === toYear) {
        if (fromMonth === 1 && toMonth === 12) return year(fromYear);
        return `${monthName(fromMonth)}–${monthName(toMonth)} ${year(fromYear)}`;
      }
      return `${monthName(fromMonth)} ${year(fromYear)} – ${monthName(toMonth)} ${year(toYear)}`;
    };

    const name = (value: Bilingual) => (locale === "ar" ? value.ar : value.en);

    return {
      decimal,
      integer,
      percent,
      percent1,
      signedPercent,
      weight,
      monthName,
      year,
      range,
      name,
    };
  }, [locale, t]);
}
