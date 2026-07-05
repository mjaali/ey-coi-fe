import {
  resolveAutoThemeHour,
  SKY_STOPS,
  type Rgb,
  type SkyStop,
} from "@/config/theme";

const WHITE: Rgb = [255, 255, 255];
const INK: Rgb = [18, 18, 28];

export const SKY_THEME_VARS = [
  "--app-bg",
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--border",
  "--input",
  "--ring",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
] as const;

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return lerpRgb(a, b, t);
}

export function rgb([r, g, b]: Rgb) {
  return `rgb(${r}, ${g}, ${b})`;
}

function rgba([r, g, b]: Rgb, alpha: number) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

export type SkyPalette = {
  top: Rgb;
  mid: Rgb;
  bottom: Rgb;
  dark: boolean;
};

export function resolveSkyPalette(date = new Date()): SkyPalette {
  const { lower, upper, t } = segmentFor(resolveAutoThemeHour(date));

  return {
    top: lerpRgb(lower.top, upper.top, t),
    mid: lerpRgb(lower.mid, upper.mid, t),
    bottom: lerpRgb(lower.bottom, upper.bottom, t),
    dark: t < 0.5 ? lower.dark : upper.dark,
  };
}

export function skyThemeVariables({
  top,
  mid,
  bottom,
  dark,
}: SkyPalette): Record<(typeof SKY_THEME_VARS)[number], string> {
  const background = bottom;
  const card = dark
    ? mixRgb(bottom, mid, 0.35)
    : mixRgb(bottom, WHITE, 0.55);
  const muted = dark
    ? mixRgb(bottom, mid, 0.6)
    : mixRgb(mid, bottom, 0.45);
  const accent = dark
    ? mixRgb(mid, top, 0.4)
    : mixRgb(mid, top, 0.25);
  const foreground = dark
    ? mixRgb(top, WHITE, 0.88)
    : mixRgb(top, INK, 0.82);
  const mutedForeground = dark
    ? mixRgb(foreground, mid, 0.45)
    : mixRgb(foreground, mid, 0.5);
  const primary = dark
    ? mixRgb(top, WHITE, 0.75)
    : mixRgb(top, INK, 0.65);
  const primaryForeground = dark ? bottom : mixRgb(bottom, WHITE, 0.9);
  const borderColor = dark
    ? mixRgb(foreground, bottom, 0.25)
    : mixRgb(foreground, bottom, 0.2);
  const border = rgba(borderColor, dark ? 0.14 : 0.16);
  const input = rgba(borderColor, dark ? 0.18 : 0.22);
  const ring = dark ? mixRgb(mid, top, 0.5) : mixRgb(mid, top, 0.4);
  const gradient = `linear-gradient(180deg, ${rgb(top)} 0%, ${rgb(mid)} 52%, ${rgb(
    bottom
  )} 100%)`;

  return {
    "--app-bg": gradient,
    "--background": rgb(background),
    "--foreground": rgb(foreground),
    "--card": rgb(card),
    "--card-foreground": rgb(foreground),
    "--popover": rgb(card),
    "--popover-foreground": rgb(foreground),
    "--primary": rgb(primary),
    "--primary-foreground": rgb(primaryForeground),
    "--secondary": rgb(muted),
    "--secondary-foreground": rgb(foreground),
    "--muted": rgb(muted),
    "--muted-foreground": rgb(mutedForeground),
    "--accent": rgb(accent),
    "--accent-foreground": rgb(foreground),
    "--border": border,
    "--input": input,
    "--ring": rgb(ring),
    "--sidebar": rgb(card),
    "--sidebar-foreground": rgb(foreground),
    "--sidebar-primary": rgb(primary),
    "--sidebar-primary-foreground": rgb(primaryForeground),
    "--sidebar-accent": rgb(muted),
    "--sidebar-accent-foreground": rgb(foreground),
    "--sidebar-border": border,
    "--sidebar-ring": rgb(ring),
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
