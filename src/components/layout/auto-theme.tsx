"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import {
  SUNRISE_START,
  SUNRISE_END,
  SUNSET_START,
  SUNSET_END,
} from "@/config/theme";

type RGB = [number, number, number];

const DUSK_STOPS: { p: number; top: RGB; mid: RGB; bottom: RGB }[] = [
  { p: 0, top: [207, 227, 245], mid: [246, 217, 184], bottom: [249, 201, 163] },
  { p: 0.5, top: [246, 161, 90], mid: [240, 97, 109], bottom: [176, 70, 138] },
  { p: 1, top: [36, 27, 58], mid: [26, 23, 48], bottom: [7, 7, 15] },
];

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function rgb([r, g, b]: RGB) {
  return `rgb(${r}, ${g}, ${b})`;
}

function duskGradient(p: number): string {
  const clamped = Math.min(1, Math.max(0, p));
  let lower = DUSK_STOPS[0];
  let upper = DUSK_STOPS[DUSK_STOPS.length - 1];
  for (let i = 0; i < DUSK_STOPS.length - 1; i++) {
    if (clamped >= DUSK_STOPS[i].p && clamped <= DUSK_STOPS[i + 1].p) {
      lower = DUSK_STOPS[i];
      upper = DUSK_STOPS[i + 1];
      break;
    }
  }
  const span = upper.p - lower.p || 1;
  const t = (clamped - lower.p) / span;
  const top = lerpRgb(lower.top, upper.top, t);
  const mid = lerpRgb(lower.mid, upper.mid, t);
  const bottom = lerpRgb(lower.bottom, upper.bottom, t);
  return `linear-gradient(180deg, ${rgb(top)} 0%, ${rgb(mid)} 52%, ${rgb(bottom)} 100%)`;
}

type Resolved = { dark: boolean; gradient: string | null };

function resolveForNow(date = new Date()): Resolved {
  const h = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

  if (h >= SUNSET_START && h < SUNSET_END) {
    const p = (h - SUNSET_START) / (SUNSET_END - SUNSET_START);
    return { dark: p >= 0.5, gradient: duskGradient(p) };
  }

  if (h >= SUNRISE_START && h < SUNRISE_END) {
    const p = (h - SUNRISE_START) / (SUNRISE_END - SUNRISE_START); // 0 night -> 1 day
    return { dark: p < 0.5, gradient: duskGradient(1 - p) };
  }

  const isDay = h >= SUNRISE_END && h < SUNSET_START;
  return { dark: !isDay, gradient: null };
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
      const { dark, gradient } = resolveForNow();
      root.classList.toggle("dark", dark);
      if (gradient) {
        root.style.setProperty("--app-bg", gradient);
      } else {
        root.style.removeProperty("--app-bg");
      }
    };

    apply();
    const id = window.setInterval(apply, 60_000);
    const onFocus = () => apply();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      root.style.removeProperty("--app-bg");
    };
  }, [theme]);

  return null;
}
