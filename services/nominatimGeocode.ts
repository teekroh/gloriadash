/**
 * OpenStreetMap Nominatim (free geocoding). See https://operations.osmfoundation.org/policies/nominatim/
 * — use sparingly (≈1 req/s), identify app via User-Agent, cache results in production if volume grows.
 */

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export type NominatimGeocodeResult =
  | { ok: true; displayName: string; lat: string; lon: string; importance?: number }
  | { ok: false; reason: string };

function nominatimUserAgent(): string {
  return (
    process.env.NOMINATIM_USER_AGENT?.trim() ||
    "GloriaCRM/1.0 (local sales outreach; contact: https://example.com/contact)"
  );
}

/** Best-effort geocode from city / state / ZIP (no street on Lead model yet). */
export async function geocodeCityStateZip(
  city: string,
  state: string,
  zip: string
): Promise<NominatimGeocodeResult> {
  const q = [city, state, zip].map((s) => (s ?? "").trim()).filter(Boolean).join(", ");
  if (q.length < 3) return { ok: false, reason: "empty_query" };

  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("q", q);

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 12_000);

  try {
    const res = await fetch(url.toString(), {
      signal: ac.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": nominatimUserAgent()
      },
      cache: "no-store"
    });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    const data = (await res.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
      importance?: number;
    }>;
    const first = data[0];
    if (!first?.lat || !first?.lon) return { ok: false, reason: "no_results" };
    return {
      ok: true,
      lat: first.lat,
      lon: first.lon,
      displayName: (first.display_name ?? q).slice(0, 200),
      importance: first.importance
    };
  } catch (e) {
    const msg = e instanceof Error ? e.name : "fetch_error";
    return { ok: false, reason: msg };
  } finally {
    clearTimeout(t);
  }
}
