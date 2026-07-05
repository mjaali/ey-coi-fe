export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const MAP_STYLES = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
} as const;

/** Default viewport centered on the Kingdom of Saudi Arabia. */
export const SAUDI_VIEW = {
  longitude: 45.0792,
  latitude: 23.8859,
  zoom: 4.8,
} as const;
