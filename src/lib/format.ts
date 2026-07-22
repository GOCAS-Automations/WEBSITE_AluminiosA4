export function formatCOP(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(v as number) ? (v as number) : 0);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Convierte "14" o 14 a "14 cm" limpio (sin decimales innecesarios). */
export function cm(v: number | string | null | undefined): string | null {
  if (v === null || v === undefined || v === "") return null;
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(num)) return null;
  const clean = Number.isInteger(num) ? String(num) : String(num).replace(".", ",");
  return `${clean} cm`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
