/** Numbers/Excel sometimes export a one-cell title row before the real header row. */
function skipLeadingTitleRow(lines: string[]): { headerIdx: number; dataStartIdx: number } {
  if (lines.length < 2) return { headerIdx: 0, dataStartIdx: 1 };
  const first = lines[0]!.trim();
  const second = lines[1]!.trim();
  if (!first || !second) return { headerIdx: 0, dataStartIdx: 1 };
  const firstCells = parseLine(first);
  const secondCells = parseLine(second);
  /** Sheet title row from Numbers/Excel is one cell; real header row has many columns. */
  if (firstCells.length === 1 && secondCells.length >= 5) {
    return { headerIdx: 1, dataStartIdx: 2 };
  }
  return { headerIdx: 0, dataStartIdx: 1 };
}

export const parseCsv = (raw: string): Record<string, string>[] => {
  const cleanedRaw = raw.replace(/^\uFEFF/, "");
  const lines = cleanedRaw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];
  const { headerIdx, dataStartIdx } = skipLeadingTitleRow(lines);
  const headers = parseLine(lines[headerIdx]!).map((h) => h.replace(/^"|"$/g, "").trim());

  return lines.slice(dataStartIdx).map((line) => {
    const cols = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header || `col_${idx}`] = (cols[idx] ?? "").replace(/^"|"$/g, "").trim();
    });
    return row;
  });
};

const parseLine = (line: string) => {
  const out: string[] = [];
  let curr = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        curr += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(curr);
      curr = "";
      continue;
    }
    curr += ch;
  }
  out.push(curr);
  return out;
};
