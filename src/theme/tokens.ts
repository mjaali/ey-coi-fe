
export const brand = {
  navy: "#0A0E14",
  blue: "#1A2332",
  sky: "#5CE1FF",
  lightBlue: "#9AE8FF",
  darkGreen: "#0A3D2A",
  green: "#3DFF8A",
  lime: "#A8FF6B",
  mint: "#C8FFD4",
  purple: "#7B8CFF",
  lightPurple: "#A8B4FF",
  palePurple: "#C7CDE9",
  amber: "#FF9F43",
  amberMuted: "#FFC078",
} as const;

export type BrandColor = keyof typeof brand;

/** Neutral surfaces from the HUD guideline. */
export const neutrals = {
  background: "#F2F4F7",
  surface: "#E8ECF1",
  text: brand.navy,
} as const;

export const appBg = {
  light: neutrals.background,
  dark: brand.navy,
} as const;

/** Chart / Sankey / categorical series — green + cyan + amber. */
export const chart = {
  1: "#0F8F4D",
  2: "#1A7F99",
  3: "#E07A1A",
  4: "#4A56C7",
  5: "#5A6573",
} as const;

export const chartDark = {
  1: brand.green,
  2: brand.sky,
  3: brand.amber,
  4: brand.lightPurple,
  5: brand.lime,
} as const;

/** Named accents for multi-series UI (flow, mode, rank). */
export const accentHex = {
  blue: brand.blue,
  sky: brand.sky,
  green: brand.green,
  purple: brand.purple,
  lightPurple: brand.lightPurple,
  mint: brand.mint,
  lime: brand.lime,
  amber: brand.amber,
} as const;

export type AccentName = keyof typeof accentHex;

/** CSS custom property names for runtime reads (`getComputedStyle`). */
export const cssVars = {
  background: "--background",
  foreground: "--foreground",
  surface: "--surface",
  primary: "--primary",
  primaryHover: "--primary-hover",
  card: "--card",
  border: "--border",
  muted: "--muted",
  success: "--success",
  warning: "--warning",
  info: "--info",
  destructive: "--destructive",
  appBg: "--app-bg",
  appBgSolid: "--app-bg-solid",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
} as const;

export function cssVar(name: (typeof cssVars)[keyof typeof cssVars] | string) {
  return `var(${name})`;
}

/** Read a resolved CSS variable from the document root (client-only). */
export function readCssVar(
  name: (typeof cssVars)[keyof typeof cssVars] | string,
  fallback = ""
) {
  if (typeof document === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}
