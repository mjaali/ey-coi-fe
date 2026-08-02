"use client";

import { useSyncExternalStore } from "react";
import { Clock, LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { THEME_MODES, type ThemeMode } from "@/theme";
import { cn } from "@/lib/utils";

const MODE_ICONS: Record<ThemeMode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
  auto: Clock,
};

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const t = useTranslations("ThemeToggle");
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex items-center gap-0.5 rounded-full border border-border p-0.5"
    >
      {THEME_MODES.map((value) => {
        const Icon = MODE_ICONS[value];
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            aria-label={t(value)}
            title={t(value)}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
