"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import {
  resolveAutoThemeHour,
  SKY_STOPS,
  type Rgb,
  type SkyStop,
} from "@/config/theme";

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function rgb([r, g, b]: Rgb) {
  return `rgb(${r}, ${g}, ${b})`;
}


function segmentFor(hour: number): { lower: SkyStop; upper: SkyStop; t: number } {
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    const lower = SKY_STOPS[i];
    const upper = SKY_STOPS[i + 1];
    if (hour >= lower.hour && hour <= upper.hour) {
      const span = upper.hour - lower.hour || 1;
      return { lower, upper, t: (hour - lower.hour) / span };
    }
  }
  const lower = SKY_STOPS[SKY_STOPS.length - 2];
  const upper = SKY_STOPS[SKY_STOPS.length - 1];
  return { lower, upper, t: 1 };
}

type Sky = { dark: boolean; gradient: string };

export function skyForDate(date = new Date()): Sky {
  const { lower, upper, t } = segmentFor(resolveAutoThemeHour(date));

  const top = lerpRgb(lower.top, upper.top, t);
  const mid = lerpRgb(lower.mid, upper.mid, t);
  const bottom = lerpRgb(lower.bottom, upper.bottom, t);

  return {
    dark: t < 0.5 ? lower.dark : upper.dark,
    gradient: `linear-gradient(180deg, ${rgb(top)} 0%, ${rgb(mid)} 52%, ${rgb(
      bottom
    )} 100%)`,
  };
}

export function AutoTheme() {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    if (theme !== "auto") {
      root.style.removeProperty("--app-bg");
      return;
    }

    const apply = () => {
      const { dark, gradient } = skyForDate();
      root.classList.toggle("dark", dark);
      root.style.setProperty("--app-bg", gradient);
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
      root.style.removeProperty("--app-bg");
    };
  }, [theme]);

  return null;
}
