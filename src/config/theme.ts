// Selectable theme modes. Shared by the ThemeProvider (`themes` prop) and the
// theme toggle so the two can't drift apart.
export const THEME_MODES = ["light", "dark", "system", "auto"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

// Auto-theme transition windows, expressed as fractional hours (e.g. 5.5 = 5:30 AM).
// During sunrise/sunset the app cross-fades its background gradient and flips dark mode.
export const SUNRISE_START = 5.5;
export const SUNRISE_END = 7.5;
export const SUNSET_START = 17.5;
export const SUNSET_END = 19.5;
