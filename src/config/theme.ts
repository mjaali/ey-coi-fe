// Selectable theme modes. Shared by the ThemeProvider (`themes` prop) and the
// theme toggle so the two can't drift apart.
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
  { hour: 0, top: [8, 10, 26], mid: [13, 15, 36], bottom: [22, 20, 48], dark: true },
  { hour: 5, top: [34, 40, 78], mid: [70, 62, 116], bottom: [120, 90, 124], dark: true },
  { hour: 6.5, top: [120, 158, 212], mid: [239, 168, 136], bottom: [250, 196, 150], dark: false },
  { hour: 9, top: [148, 194, 238], mid: [198, 222, 246], bottom: [231, 240, 250], dark: false },
  { hour: 12, top: [122, 180, 238], mid: [178, 214, 246], bottom: [223, 238, 250], dark: false },
  { hour: 16, top: [124, 176, 232], mid: [208, 214, 238], bottom: [246, 232, 214], dark: false },
  { hour: 18.5, top: [238, 146, 96], mid: [242, 110, 110], bottom: [178, 74, 132], dark: false },
  { hour: 20, top: [66, 56, 108], mid: [46, 40, 84], bottom: [32, 28, 62], dark: true },
  { hour: 22, top: [14, 16, 40], mid: [12, 14, 32], bottom: [20, 20, 46], dark: true },
  { hour: 24, top: [8, 10, 26], mid: [13, 15, 36], bottom: [22, 20, 48], dark: true },
];
