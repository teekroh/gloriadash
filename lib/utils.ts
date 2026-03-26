export const uid = () => Math.random().toString(36).slice(2, 11);

export const asNum = (value: string | undefined) => {
  const cleaned = (value ?? "").replaceAll(/[^0-9.-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
};

export const addBusinessDays = (isoDate: string, days: number) => {
  const date = new Date(isoDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date.toISOString();
};
