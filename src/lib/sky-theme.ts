import {
  appBg,
  resolveAutoThemeHour,
  SKY_STOPS,
  type SkyStop,
} from "@/theme";

/** CSS variables auto-mode may override. Empty when relying on :root / .dark tokens. */
export const SKY_THEME_VARS = [
  "--app-bg",
  "--app-bg-solid",
] as const;

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

export type SkyPalette = {
  dark: boolean;
};

/**
 * Auto theme resolves to MODON light or dark only — solid colors, no gradients.
 * Daytime → light tokens via clearing overrides; night → .dark class.
 */
export function resolveSkyPalette(date = new Date()): SkyPalette {
  const { lower, upper, t } = segmentFor(resolveAutoThemeHour(date));
  return {
    dark: t < 0.5 ? lower.dark : upper.dark,
  };
}

export function skyThemeVariables({
  dark,
}: SkyPalette): Record<(typeof SKY_THEME_VARS)[number], string> {
  const solid = dark ? appBg.dark : appBg.light;
  return {
    "--app-bg": solid,
    "--app-bg-solid": solid,
  };
}

export function skyThemeForDate(date = new Date()) {
  const palette = resolveSkyPalette(date);
  return {
    ...palette,
    gradient: skyThemeVariables(palette)["--app-bg"],
    variables: skyThemeVariables(palette),
  };
}
