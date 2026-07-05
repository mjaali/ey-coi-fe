"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import {
  SKY_THEME_VARS,
  skyThemeForDate,
} from "@/lib/sky-theme";

export function AutoTheme() {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    const clearSkyTheme = () => {
      root.removeAttribute("data-theme");
      for (const name of SKY_THEME_VARS) {
        root.style.removeProperty(name);
      }
    };

    if (theme !== "auto") {
      clearSkyTheme();
      return;
    }

    const apply = () => {
      const { dark, variables } = skyThemeForDate();
      root.dataset.theme = "auto";
      root.classList.toggle("dark", dark);
      for (const [name, value] of Object.entries(variables)) {
        root.style.setProperty(name, value);
      }
    };

    apply();
    const interval = window.setInterval(apply, 60_000);
    const onActive = () => apply();
    window.addEventListener("focus", onActive);
    document.addEventListener("visibilitychange", onActive);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onActive);
      document.removeEventListener("visibilitychange", onActive);
      clearSkyTheme();
    };
  }, [theme]);

  return null;
}
