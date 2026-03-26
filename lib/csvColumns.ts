/** Normalize CSV header keys for alias matching (spaces/underscores/case). */
export function normalizeCsvKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

/** Build lookup: normalized header -> value */
export function csvRowIndex(row: Record<string, string>): Map<string, string> {
  const m = new Map<string, string>();
  for (const [k, v] of Object.entries(row)) {
    m.set(normalizeCsvKey(k), v ?? "");
  }
  return m;
}

/**
 * Read first non-empty cell matching any alias (after normalizing keys).
 * Supports: Address_Confidence, address_confidence, "Address Confidence", etc.
 */
export function getCsvColumn(row: Record<string, string>, aliases: string[]): string {
  const idx = csvRowIndex(row);
  for (const a of aliases) {
    const v = idx.get(normalizeCsvKey(a));
    if (v !== undefined && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}
