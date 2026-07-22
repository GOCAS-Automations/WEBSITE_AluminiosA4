export function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export function toNum(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim().replace(/\s/g, "").replace(",", ".");
  if (s === "") return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function boolFrom(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseJsonArray(v: FormDataEntryValue | null): any[] {
  try {
    const arr = JSON.parse(String(v ?? "[]"));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
