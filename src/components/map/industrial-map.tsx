"use client";

import { useMemo, useState } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import { useTheme } from "next-themes";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MAP_STYLES,
  MAPBOX_TOKEN,
  SAUDI_VIEW,
} from "@/config/mapbox";
import { industrialCities, type IndustrialCity } from "@/data/industrial-cities";
import { cn } from "@/lib/utils";
import { accentFillClasses } from "@/theme";

type IndustrialMapProps = {
  locale: "en" | "ar";
  className?: string;
  factoriesLabel: string;
  tokenMissingMessage: string;
};

function cityName(city: IndustrialCity, locale: "en" | "ar") {
  return city.name[locale] ?? city.name.en;
}

export function IndustrialMap({
  locale,
  className,
  factoriesLabel,
  tokenMissingMessage,
}: IndustrialMapProps) {
  const { resolvedTheme } = useTheme();
  const [activeCity, setActiveCity] = useState<IndustrialCity | null>(null);

  const mapStyle = useMemo(
    () =>
      resolvedTheme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light,
    [resolvedTheme]
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        {tokenMissingMessage}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border", className)}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={SAUDI_VIEW}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        reuseMaps
        onClick={() => setActiveCity(null)}
      >
        <NavigationControl position="top-left" showCompass={false} />

        {industrialCities.map((city) => (
          <Marker
            key={city.id}
            longitude={city.coordinates[0]}
            latitude={city.coordinates[1]}
            anchor="center"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setActiveCity(city);
            }}
          >
            <button
              type="button"
              aria-label={cityName(city, locale)}
              className={cn(
                "h-3 w-3 rounded-full border-2 border-background shadow-md transition-transform hover:scale-125",
                accentFillClasses.green,
                activeCity?.id === city.id && "scale-125 ring-2 ring-modon-green/40"
              )}
            />
          </Marker>
        ))}

        {activeCity && (
          <Popup
            longitude={activeCity.coordinates[0]}
            latitude={activeCity.coordinates[1]}
            anchor="bottom"
            offset={12}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setActiveCity(null)}
            className="[&_.mapboxgl-popup-content]:rounded-xl [&_.mapboxgl-popup-content]:border [&_.mapboxgl-popup-content]:border-border [&_.mapboxgl-popup-content]:bg-card [&_.mapboxgl-popup-content]:p-3 [&_.mapboxgl-popup-content]:shadow-lg [&_.mapboxgl-popup-tip]:hidden"
          >
            <div className="flex flex-col gap-0.5 text-sm">
              <span className="font-semibold text-foreground">
                {cityName(activeCity, locale)}
              </span>
              <span className="text-muted-foreground">
                {activeCity.factories.toLocaleString(locale === "ar" ? "ar" : "en-US")}{" "}
                {factoriesLabel}
              </span>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
