"use client";

import { useMemo, useState } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_STYLES, MAPBOX_TOKEN, SAUDI_VIEW } from "@/config/mapbox";
import { cityCoordinates } from "@/data/city-coordinates";
import type { RankRow } from "@/lib/customs/demand";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useDemandFormat } from "./format";

type DemandMapProps = {
  locale: Locale;
  cities: RankRow[];
  className?: string;
};

type MapCity = RankRow & {
  coordinates: [number, number];
  radius: number;
};

function markerRadius(share: number, maxShare: number) {
  if (maxShare <= 0) return 8;
  const t = Math.sqrt(share / maxShare);
  return 8 + t * 22;
}

export function DemandMap({ locale, cities, className }: DemandMapProps) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const { resolvedTheme } = useTheme();
  const [active, setActive] = useState<MapCity | null>(null);

  const mapStyle = useMemo(
    () => (resolvedTheme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light),
    [resolvedTheme]
  );

  const points = useMemo(() => {
    const located: MapCity[] = [];
    for (const city of cities) {
      const coordinates = cityCoordinates(city.key);
      if (!coordinates) continue;
      located.push({
        ...city,
        coordinates,
        radius: 8,
      });
    }
    const maxShare = located.reduce((max, c) => Math.max(max, c.share), 0);
    return located.map((city) => ({
      ...city,
      radius: markerRadius(city.share, maxShare),
    }));
  }, [cities]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground",
          className
        )}
      >
        {t("mapTokenMissing")}
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground",
          className
        )}
      >
        {t("mapEmpty")}
      </div>
    );
  }

  return (
    <div
      className={cn("overflow-hidden rounded-3xl border border-border", className)}
    >
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={SAUDI_VIEW}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        reuseMaps
        onClick={() => setActive(null)}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {points.map((city) => (
          <Marker
            key={city.key}
            longitude={city.coordinates[0]}
            latitude={city.coordinates[1]}
            anchor="center"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setActive(city);
            }}
          >
            <button
              type="button"
              aria-label={fmt.name(city.label)}
              style={{ width: city.radius * 2, height: city.radius * 2 }}
              className={cn(
                "rounded-full border-2 border-background bg-sky-500/80 shadow-md transition-transform hover:scale-110",
                active?.key === city.key && "scale-110 ring-2 ring-sky-500/50"
              )}
            />
          </Marker>
        ))}

        {active && (
          <Popup
            longitude={active.coordinates[0]}
            latitude={active.coordinates[1]}
            anchor="bottom"
            offset={active.radius + 8}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setActive(null)}
            className="[&_.mapboxgl-popup-content]:rounded-xl [&_.mapboxgl-popup-content]:border [&_.mapboxgl-popup-content]:border-border [&_.mapboxgl-popup-content]:bg-card [&_.mapboxgl-popup-content]:p-3 [&_.mapboxgl-popup-content]:shadow-lg [&_.mapboxgl-popup-tip]:hidden"
          >
            <div className="flex min-w-[10rem] flex-col gap-0.5 text-sm">
              <span className="font-semibold text-foreground">
                {fmt.name(active.label)}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {fmt.weight(active.current.kg)}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {fmt.percent1.format(active.share)} ·{" "}
                {t("declarationsCount", {
                  count: fmt.integer.format(active.current.declarations),
                })}
              </span>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
