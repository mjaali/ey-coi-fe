"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CountryOption } from "@/lib/customs/demand";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useDemandFormat } from "@/components/demand/format";

/** Strips Arabic diacritics and the definite article so search is forgiving. */
function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u0652]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/^ال/, "");
}

export function CountryPicker({
  locale,
  options,
  value,
  onChange,
  disabled,
  fullWidth,
}: {
  locale: Locale;
  options: CountryOption[];
  value: string | null;
  onChange: (code: string | null) => void;
  disabled?: boolean;
  /** Stretch the trigger to the sidebar width. */
  fullWidth?: boolean;
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.code === value) ?? null,
    [options, value]
  );

  const results = useMemo(() => {
    const q = normalise(query.trim());
    if (!q) return options.slice(0, 60);
    return options
      .filter(
        (o) =>
          normalise(o.name.en).includes(q) ||
          normalise(o.name.ar).includes(q) ||
          o.code.toLowerCase().startsWith(q)
      )
      .slice(0, 60);
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const select = (code: string | null) => {
    onChange(code);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className={cn("relative", fullWidth && "w-full")}>
      <div className={cn("flex items-center gap-1", fullWidth && "w-full")}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "flex h-8 items-center gap-2 border px-3 text-sm font-medium transition-colors disabled:opacity-50",
            fullWidth ? "min-w-0 flex-1 rounded-xl" : "rounded-full",
            selected
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          )}
        >
          {selected ? (
            <span className="text-base leading-none">
              {selected.flag || <Globe className="h-4 w-4" aria-hidden />}
            </span>
          ) : (
            <Globe className="h-4 w-4 shrink-0" aria-hidden />
          )}
          <span className={cn("truncate", fullWidth ? "flex-1 text-start" : "max-w-[12rem]")}>
            {selected ? fmt.name(selected.name) : t("countryAll")}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        {selected && (
          <button
            type="button"
            onClick={() => select(null)}
            aria-label={t("countryClear")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full z-50 mt-2 w-full min-w-[min(22rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-border bg-popover shadow-xl ltr:left-0 rtl:right-0">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("countrySearch")}
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <ul role="listbox" className="max-h-72 overflow-y-auto p-1.5">
            <li>
              <button
                type="button"
                onClick={() => select(null)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Globe
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="flex-1 text-start font-medium">
                  {t("countryAll")}
                </span>
                {value === null && <Check className="h-4 w-4" aria-hidden />}
              </button>
            </li>

            {results.map((option) => (
              <li key={option.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.code === value}
                  onClick={() => select(option.code)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <span className="w-5 shrink-0 text-base leading-none">
                    {option.flag}
                  </span>
                  <span className="flex-1 truncate text-start">
                    {fmt.name(option.name)}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {fmt.weight(option.kg)}
                  </span>
                  {option.code === value && (
                    <Check className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            ))}

            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t("countryNoResults")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
