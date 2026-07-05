export const AUTO_THEME_TEST_HOUR: number | null = null;

export const THEME_MODES = ["light", "dark", "system", "auto"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export type Rgb = readonly [number, number, number];


export type SkyStop = {
  hour: number;
  top: Rgb;
  mid: Rgb;
  bottom: Rgb;
  dark: boolean;
};

export const SKY_STOPS: readonly SkyStop[] = [
    { hour: 0, top: [10, 12, 24], mid: [15, 17, 32], bottom: [24, 24, 42], dark: true },
    { hour: 5, top: [38, 44, 72], mid: [74, 70, 102], bottom: [116, 96, 116], dark: true },
    { hour: 6.5, top: [138, 166, 204], mid: [224, 178, 156], bottom: [238, 204, 172], dark: false },
    { hour: 9, top: [166, 202, 232], mid: [208, 226, 242], bottom: [236, 242, 248], dark: false },
    { hour: 12, top: [148, 194, 232], mid: [196, 220, 242], bottom: [232, 240, 248], dark: false },
    { hour: 16.5, top: [150, 190, 226], mid: [212, 218, 236], bottom: [240, 230, 216], dark: false },
    { hour: 18, top: [214, 154, 118], mid: [218, 132, 128], bottom: [154, 92, 126], dark: false },
    { hour: 20, top: [62, 58, 96], mid: [48, 46, 78], bottom: [34, 34, 56], dark: true },
    { hour: 22, top: [16, 18, 36], mid: [14, 16, 30], bottom: [22, 22, 42], dark: true },
    { hour: 24, top: [10, 12, 24], mid: [15, 17, 32], bottom: [24, 24, 42], dark: true },
  ];

export function resolveAutoThemeHour(date = new Date()): number {
  if (AUTO_THEME_TEST_HOUR !== null) {
    return ((AUTO_THEME_TEST_HOUR % 24) + 24) % 24;
  }
  return (
    date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  );
}
