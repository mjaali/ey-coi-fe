import type { CommandCenterFilters } from "@/lib/command-center/data";

/** Encode shared demand filters + geography selection into query params. */
export function commandCenterQuery(filters: CommandCenterFilters): string {
  const params = new URLSearchParams();
  if (filters.period !== "all") params.set("period", filters.period);
  if (filters.country) params.set("country", filters.country);
  if (filters.flow !== "import") params.set("flow", filters.flow);
  if (filters.region !== "all") params.set("region", filters.region);
  if (filters.industrialCity !== "all") {
    params.set("industrialCity", filters.industrialCity);
  }
  return params.toString();
}
