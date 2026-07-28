"use client";

import { useMemo } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import { useTheme } from "next-themes";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { MAP_STYLES, MAPBOX_TOKEN, SAUDI_VIEW } from "@/config/mapbox";
import type {
  CommandCenterFilters,
  GeographySelection,
  MapPoint,
} from "@/lib/command-center/data";
import { commandCenterQuery } from "@/lib/command-center/query";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type NationalGapMapProps = {
  locale: Locale;
  filters: CommandCenterFilters;
  points: MapPoint[];
  selection: GeographySelection | null;
  className?: string;
};

function pickTone(score: number) {
  if (score >= 75) return "bg-rose-500";
  if (score >= 55) return "bg-amber-500";
  return "bg-emerald-500";
}

function pickLabel(score: number, t: ReturnType<typeof useTranslations>) {
  if (score >= 75) return t("map.legend.highGap");
  if (score >= 55) return t("map.legend.moderateGap");
  return t("map.legend.strongCoverage");
}

function nameOf(locale: Locale, value: { en: string; ar: string }) {
  return locale === "ar" ? value.ar : value.en;
}

export function NationalGapMap({
  locale,
  filters,
  points,
  selection,
  className,
}: NationalGapMapProps) {
  const t = useTranslations("GapAnalysisPage");
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const mapStyle = useMemo(
    () => (resolvedTheme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light),
    [resolvedTheme]
  );

  const activePoint = selection?.kind === "city"
    ? points.find((point) => point.cityId === selection.id) ?? null
    : null;

  const updateFilters = (next: Partial<CommandCenterFilters>) => {
    const query = commandCenterQuery({ ...filters, ...next });
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={cn(
          "flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        {t("map.tokenMissing")}
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground",
          className
        )}
      >
        {t("empty.map")}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={SAUDI_VIEW}
          mapStyle={mapStyle}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          reuseMaps
          onClick={() => updateFilters({ region: "all", industrialCity: "all" })}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {points.map((point) => (
            <Marker
              key={point.id}
              longitude={point.coordinates[0]}
              latitude={point.coordinates[1]}
              anchor="center"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                updateFilters({
                  region: point.regionId,
                  industrialCity: point.cityId,
                });
              }}
            >
              <button
                type="button"
                aria-label={nameOf(locale, point.city)}
                className={cn(
                  "h-4 w-4 rounded-full border-2 border-background shadow-md transition-transform hover:scale-110",
                  pickTone(point.severityScore),
                  activePoint?.cityId === point.cityId && "scale-110 ring-2 ring-foreground/30"
                )}
              />
            </Marker>
          ))}

          {activePoint && (
            <Popup
              longitude={activePoint.coordinates[0]}
              latitude={activePoint.coordinates[1]}
              anchor="bottom"
              offset={16}
              closeButton={false}
              closeOnClick={false}
              className="[&_.mapboxgl-popup-content]:rounded-xl [&_.mapboxgl-popup-content]:border [&_.mapboxgl-popup-content]:border-border [&_.mapboxgl-popup-content]:bg-card [&_.mapboxgl-popup-content]:p-3 [&_.mapboxgl-popup-content]:shadow-lg [&_.mapboxgl-popup-tip]:hidden"
            >
              <div className="flex min-w-[12rem] flex-col gap-1 text-sm">
                <span className="font-semibold">{nameOf(locale, activePoint.city)}</span>
                <span className="text-muted-foreground">{nameOf(locale, activePoint.region)}</span>
                <span className="text-xs text-muted-foreground">
                  {pickLabel(activePoint.severityScore, t)}
                </span>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <LegendDot className="bg-rose-500" label={t("map.legend.highGap")} />
        <LegendDot className="bg-amber-500" label={t("map.legend.moderateGap")} />
        <LegendDot className="bg-emerald-500" label={t("map.legend.strongCoverage")} />
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} aria-hidden />
      <span>{label}</span>
    </div>
  );
}
