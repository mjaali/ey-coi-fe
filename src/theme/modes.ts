export const AUTO_THEME_TEST_HOUR: number | null = null;

export const THEME_MODES = ["light", "dark", "system", "auto"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export type Rgb = readonly [number, number, number];

export type SkyStop = {
  hour: number;
  /** Retained for schedule structure; auto mode only uses `dark`. */
  top: Rgb;
  mid: Rgb;
  bottom: Rgb;
  dark: boolean;
};

/** Day/night schedule for auto theme (MODON light ↔ dark). */
export const SKY_STOPS: readonly SkyStop[] = [
  { hour: 0, top: [11, 35, 64], mid: [11, 35, 64], bottom: [11, 35, 64], dark: true },
  { hour: 5, top: [11, 35, 64], mid: [11, 35, 64], bottom: [11, 35, 64], dark: true },
  { hour: 6.5, top: [255, 255, 255], mid: [247, 247, 247], bottom: [255, 255, 255], dark: false },
  { hour: 9, top: [255, 255, 255], mid: [247, 247, 247], bottom: [255, 255, 255], dark: false },
  { hour: 12, top: [255, 255, 255], mid: [247, 247, 247], bottom: [255, 255, 255], dark: false },
  { hour: 16.5, top: [255, 255, 255], mid: [247, 247, 247], bottom: [255, 255, 255], dark: false },
  { hour: 18, top: [21, 90, 125], mid: [11, 35, 64], bottom: [11, 35, 64], dark: false },
  { hour: 20, top: [11, 35, 64], mid: [11, 35, 64], bottom: [11, 35, 64], dark: true },
  { hour: 22, top: [11, 35, 64], mid: [11, 35, 64], bottom: [11, 35, 64], dark: true },
  { hour: 24, top: [11, 35, 64], mid: [11, 35, 64], bottom: [11, 35, 64], dark: true },
];

export function resolveAutoThemeHour(date = new Date()): number {
  if (AUTO_THEME_TEST_HOUR !== null) {
    return ((AUTO_THEME_TEST_HOUR % 24) + 24) % 24;
  }
  return (
    date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  );
}
