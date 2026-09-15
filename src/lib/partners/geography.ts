import { REGIONS } from "@/lib/region-data";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const coveredCities = new Map(Object.values(REGIONS).flatMap((region) => region.cities.map((city, index) => [normalize(city), { region: region.slug, regionName: region.name, cityName: city, citySlug: region.citySlugs[index] }] as const)));

export function approvedLocation(city: string | null, state: string | null) {
  if (!city || !state || normalize(state) !== "sp") return null;
  return coveredCities.get(normalize(city)) ?? null;
}
