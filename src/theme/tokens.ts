
export const brand = {
  navy: "#0B2340",
  blue: "#155A7D",
  sky: "#6AABE4",
  lightBlue: "#96D9E8",
  darkGreen: "#00584D",
  green: "#55A980",
  lime: "#7ACA6E",
  mint: "#BAE7C9",
  purple: "#38227B",
  lightPurple: "#A6A3DF",
  palePurple: "#C7CDE9",
} as const;

export type BrandColor = keyof typeof brand;

/** Neutral surfaces from the brand guideline. */
export const neutrals = {
  background: "#FFFFFF",
  surface: "#F7F7F7",
  text: brand.navy,
} as const;

export const appBg = {
  light: neutrals.background,
  dark: brand.navy,
} as const;

/** Chart / Sankey / categorical series — blue dominant, green + purple secondary. */
export const chart = {
  1: brand.blue,
  2: brand.sky,
  3: brand.green,
  4: brand.purple,
  5: brand.lime,
} as const;

export const chartDark = {
  1: brand.sky,
  2: brand.lightBlue,
  3: brand.lime,
  4: brand.lightPurple,
  5: brand.green,
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
