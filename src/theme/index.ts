/**
 * Central design system for the COI HUD app.
 *
 * Usage
 * -----
 * CSS / Tailwind utilities:
 *   Edit `tokens.css` for color values (light + dark).
 *   `bridge.css` exposes them as Tailwind classes (`bg-primary`, `text-modon-green`, …).
 *
 * TypeScript (charts, maps, shared recipes):
 *   import { brand, toneClasses, accentFillClasses } from "@/theme";
 *
 * Change a brand color once in `tokens.css` + `tokens.ts`, then the whole UI follows.
 */

export {
  accentHex,
  appBg,
  brand,
  chart,
  chartDark,
  cssVar,
  cssVars,
  neutrals,
  readCssVar,
  type AccentName,
  type BrandColor,
} from "./tokens";

export {
  accentFillClasses,
  flowFillClasses,
  gapBandFillClasses,
  gapBandTextClasses,
  gapScoreFillClass,
  legacyAccentFillClasses,
  modeFillClasses,
  severityClasses,
  surfaceClasses,
  toneClasses,
  toneFillClasses,
  toneTextClasses,
  type Accent,
  type GapBand,
  type LegacyAccent,
  type Severity,
  type Tone,
} from "./styles";

export {
  AUTO_THEME_TEST_HOUR,
  resolveAutoThemeHour,
  SKY_STOPS,
  THEME_MODES,
  type Rgb,
  type SkyStop,
  type ThemeMode,
} from "./modes";
