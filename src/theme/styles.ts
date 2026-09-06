/**
 * Shared Tailwind class recipes for the COI HUD UI.
 * Import these instead of hardcoding tone / accent / status classes in components.
 */

export type Tone = "positive" | "negative" | "warning" | "neutral" | "info";

/** Soft badge / chip surfaces with matching text. */
export const toneClasses: Record<Tone, string> = {
  positive: "bg-success-muted text-success",
  negative: "bg-destructive/10 text-destructive",
  warning: "bg-warning-muted text-warning",
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info-muted text-info",
};

/** Solid text color for inline labels. */
export const toneTextClasses: Record<Tone, string> = {
  positive: "text-success",
  negative: "text-destructive",
  warning: "text-warning",
  neutral: "text-muted-foreground",
  info: "text-info",
};

/** Solid fills (dots, bars, markers). */
export const toneFillClasses: Record<Tone, string> = {
  positive: "bg-modon-green",
  negative: "bg-destructive",
  warning: "bg-warning",
  neutral: "bg-muted-foreground",
  info: "bg-modon-sky",
};

export type Accent = "sky" | "blue" | "green" | "purple" | "lightPurple";

/** @deprecated Prefer Accent; kept for existing rank-panel prop names. */
export type LegacyAccent = "sky" | "violet" | "emerald" | "amber";

export const accentFillClasses: Record<Accent, string> = {
  sky: "bg-modon-sky",
  blue: "bg-modon-blue",
  green: "bg-modon-green",
  purple: "bg-modon-purple",
  lightPurple: "bg-modon-light-purple",
};

export const legacyAccentFillClasses: Record<LegacyAccent, string> = {
  sky: accentFillClasses.sky,
  violet: accentFillClasses.lightPurple,
  emerald: accentFillClasses.green,
  amber: "bg-warning",
};

export type Severity = "critical" | "high" | "default";

export const severityClasses: Record<Severity, string> = {
  critical: toneClasses.negative,
  high: toneClasses.warning,
  default: toneClasses.info,
};

export type GapBand = "low" | "moderate" | "high";

export const gapBandTextClasses: Record<GapBand, string> = {
  low: toneTextClasses.positive,
  moderate: toneTextClasses.warning,
  high: toneTextClasses.negative,
};

export const gapBandFillClasses: Record<GapBand, string> = {
  low: toneFillClasses.positive,
  moderate: toneFillClasses.warning,
  high: toneFillClasses.negative,
};

/** Map gap score (0–100) to a band fill class. */
export function gapScoreFillClass(score: number) {
  if (score >= 75) return gapBandFillClasses.high;
  if (score >= 55) return gapBandFillClasses.moderate;
  return gapBandFillClasses.low;
}

/** Transport mode accents — one family per mode, no mixing. */
export const modeFillClasses = {
  sea: accentFillClasses.sky,
  land: accentFillClasses.blue,
  air: accentFillClasses.green,
} as const;

/** Import vs export series. */
export const flowFillClasses = {
  import: accentFillClasses.sky,
  export: accentFillClasses.lightPurple,
} as const;

export const surfaceClasses = {
  card: "rounded-lg border border-border/80 bg-card/85 backdrop-blur-md",
  cardCompact: "rounded-md border border-border/80 bg-card/85 backdrop-blur-md",
  muted: "rounded-md bg-muted/50",
  panel: "rounded-lg border border-border/80 bg-card/85 p-4 backdrop-blur-md sm:p-5",
  glass:
    "rounded-lg border border-border/70 bg-[color-mix(in_srgb,var(--card)_78%,transparent)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_6%,transparent)] backdrop-blur-md",
} as const;
