"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { JuegoConDetalle, ProductoConColores } from "@/lib/types";
import { cn, formatCOP } from "@/lib/format";
import ProductCard from "@/components/catalog/ProductCard";
import SetCard from "@/components/catalog/SetCard";

type Tipo = "individuales" | "juegos";
type Rango = [number, number];

interface ColorOpt {
  key: string;
  nombre: string;
  hex: string | null;
}

/** minúsculas + sin acentos, para búsquedas y comparación de colores */
function norm(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const floorK = (n: number) => Math.floor(n / 1000) * 1000;
const ceilK = (n: number) => Math.ceil(n / 1000) * 1000;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/* ---------------- Slider de rango doble (sin dependencias) ---------------- */

function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  format,
  label,
}: {
  min: number;
  max: number;
  step: number;
  value: Rango;
  onChange: (v: Rango) => void;
  format: (n: number) => string;
  label: string;
}) {
  const [lo, hi] = value;
  const span = max - min || 1;
  const pctLo = clamp(((lo - min) / span) * 100, 0, 100);
  const pctHi = clamp(((hi - min) / span) * 100, 0, 100);

  const thumb =
    "pointer-events-none absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2 appearance-none bg-transparent focus:outline-none " +
    "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 " +
    "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full " +
    "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-600 " +
    "[&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,.25)] " +
    "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:border-none " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 " +
    "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full " +
    "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-600";

  return (
    <div>
      <div className="relative mt-1 h-6">
        {/* pista */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        {/* tramo seleccionado */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={`${label}: mínimo`}
          onChange={(e) => onChange([clamp(Number(e.target.value), min, hi), hi])}
          className={thumb}
          // Si ambos pulgares quedan pegados al tope, el mínimo pasa al frente
          // (es el único que puede moverse desde ahí). En el resto de casos manda
          // el máximo, para que se pueda separar de un par colapsado en el suelo.
          style={{ zIndex: lo >= max ? 4 : 2 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={`${label}: máximo`}
          onChange={(e) => onChange([lo, clamp(Number(e.target.value), lo, max)])}
          className={thumb}
          style={{ zIndex: 3 }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{format(lo)}</span>
        <span>{format(hi)}</span>
      </div>
    </div>
  );
}

/* ------------------------------- Componente ------------------------------- */

export default function CatalogoFiltrado({
  productos,
  juegos,
  tipo,
  slug,
  labelIndividuales,
  labelJuegos,
}: {
  productos: ProductoConColores[];
  juegos: JuegoConDetalle[];
  tipo: Tipo;
  slug: string;
  labelIndividuales: string;
  labelJuegos: string;
}) {
  const router = useRouter();

  const [tab, setTab] = useState<Tipo>(tipo);
  const [busqueda, setBusqueda] = useState("");
  const [precioSel, setPrecioSel] = useState<Rango | null>(null);
  const [diamSel, setDiamSel] = useState<Rango | null>(null);
  const [coloresSel, setColoresSel] = useState<string[]>([]);
  const [abierto, setAbierto] = useState(false);

  const esIndiv = tab === "individuales";

  /* ---- Límites derivados del tab actual ---- */

  const { pLo, pHi } = useMemo(() => {
    const precios = (esIndiv ? productos : juegos)
      .map((i) => i.precio)
      .filter((n) => Number.isFinite(n));
    if (precios.length === 0) return { pLo: 0, pHi: 1000 };
    const lo = floorK(Math.min(...precios));
    let hi = ceilK(Math.max(...precios));
    if (hi <= lo) hi = lo + 1000;
    return { pLo: lo, pHi: hi };
  }, [esIndiv, productos, juegos]);

  const { dLo, dHi, hayDiam } = useMemo(() => {
    const ds = productos
      .map((p) => p.diametro_cm)
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
    if (ds.length === 0) return { dLo: 0, dHi: 1, hayDiam: false };
    const lo = Math.floor(Math.min(...ds));
    let hi = Math.ceil(Math.max(...ds));
    if (hi <= lo) hi = lo + 1;
    return { dLo: lo, dHi: hi, hayDiam: true };
  }, [productos]);

  const opcionesColor = useMemo<ColorOpt[]>(() => {
    const mapa = new Map<string, ColorOpt>();
    const push = (nombre: string | null, hex: string | null) => {
      const key = norm(nombre);
      if (!key) return;
      const prev = mapa.get(key);
      if (!prev) mapa.set(key, { key, nombre: nombre ?? "", hex });
      else if (!prev.hex && hex) prev.hex = hex;
    };
    if (esIndiv) productos.forEach((p) => (p.colores ?? []).forEach((c) => push(c.nombre, c.hex)));
    else juegos.forEach((j) => (j.colores ?? []).forEach((c) => push(c.nombre, c.hex)));
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [esIndiv, productos, juegos]);

  /* ---- Valores efectivos (null = rango completo, sin filtrar) ---- */

  const precioVal: Rango = precioSel ?? [pLo, pHi];
  const diamVal: Rango = diamSel ?? [dLo, dHi];

  const precioActivo = precioVal[0] > pLo || precioVal[1] < pHi;
  const diamActivo = esIndiv && hayDiam && (diamVal[0] > dLo || diamVal[1] < dHi);
  const busquedaActiva = busqueda.trim() !== "";
  const coloresActivos = coloresSel.length > 0;

  const nActivos =
    (busquedaActiva ? 1 : 0) +
    (precioActivo ? 1 : 0) +
    (diamActivo ? 1 : 0) +
    (coloresActivos ? 1 : 0);

  /* ---- Filtrado ---- */

  const q = norm(busqueda.trim());

  const coincideTexto = (nombre: string | null, referencia: string | null) =>
    !q || norm(nombre).includes(q) || norm(referencia).includes(q);

  const coincidePrecio = (precio: number) =>
    !precioActivo || (precio >= precioVal[0] && precio <= precioVal[1]);

  const coincideColor = (colores: { nombre: string | null }[]) =>
    !coloresActivos || (colores ?? []).some((c) => coloresSel.includes(norm(c.nombre)));

  // Volúmenes pequeños (≤40 por categoría): filtrar en cada render es trivial.
  const productosFiltrados = productos.filter(
    (p) =>
      coincideTexto(p.nombre, p.referencia) &&
      coincidePrecio(p.precio) &&
      (!diamActivo ||
        (p.diametro_cm != null &&
          p.diametro_cm >= diamVal[0] &&
          p.diametro_cm <= diamVal[1])) &&
      coincideColor(p.colores ?? [])
  );

  const juegosFiltrados = juegos.filter(
    (j) =>
      coincideTexto(j.nombre, j.referencia) &&
      coincidePrecio(j.precio) &&
      coincideColor(j.colores ?? [])
  );

  const total = esIndiv ? productos.length : juegos.length;
  const mostrados = esIndiv ? productosFiltrados.length : juegosFiltrados.length;

  /* ---- Acciones ---- */

  function limpiar() {
    setBusqueda("");
    setPrecioSel(null);
    setDiamSel(null);
    setColoresSel([]);
  }

  function cambiarTab(next: Tipo) {
    if (next === tab) return;
    setTab(next);
    limpiar();
    router.replace(`/catalogo/${slug}?tipo=${next}`, { scroll: false });
  }

  function toggleColor(key: string) {
    setColoresSel((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const tabs = [
    { key: "individuales" as const, label: labelIndividuales, count: productos.length },
    { key: "juegos" as const, label: labelJuegos, count: juegos.length },
  ];

  return (
    <div>
      {/* Selector individuales / juegos */}
      <div className="mt-8 inline-flex rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => cambiarTab(t.key)}
            aria-pressed={tab === t.key}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
              tab === t.key ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                tab === t.key ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500"
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Barra de filtros */}
      {total > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            className="flex w-full items-center justify-between text-sm font-bold text-navy sm:hidden"
          >
            <span className="flex items-center gap-2">
              Filtros
              {nActivos > 0 && (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  {nActivos}
                </span>
              )}
            </span>
            <span className={cn("transition-transform", abierto && "rotate-180")} aria-hidden="true">
              ▾
            </span>
          </button>

          <div
            className={cn(
              "gap-4 sm:mt-0 sm:grid sm:grid-cols-2 lg:grid-cols-3",
              abierto ? "mt-4 grid" : "hidden"
            )}
          >
            {/* Búsqueda */}
            <div>
              <label
                htmlFor="filtro-busqueda"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >
                Buscar
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.2-3.2" />
                </svg>
                <input
                  id="filtro-busqueda"
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o referencia…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-navy placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            {/* Precio */}
            <div>
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Precio (COP)
              </span>
              <RangeSlider
                min={pLo}
                max={pHi}
                step={500}
                value={precioVal}
                onChange={(v) => setPrecioSel(v)}
                format={formatCOP}
                label="Precio"
              />
            </div>

            {/* Diámetro (solo individuales) */}
            {esIndiv && hayDiam && (
              <div>
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Diámetro (cm)
                </span>
                <RangeSlider
                  min={dLo}
                  max={dHi}
                  step={1}
                  value={diamVal}
                  onChange={(v) => setDiamSel(v)}
                  format={(n) => `${n} cm`}
                  label="Diámetro"
                />
              </div>
            )}

            {/* Colores */}
            {opcionesColor.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Color de tapa
                </span>
                <div className="flex flex-wrap gap-2">
                  {opcionesColor.map((c) => {
                    const on = coloresSel.includes(c.key);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => toggleColor(c.key)}
                        aria-pressed={on}
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          on
                            ? "border-brand-400 bg-brand-50 text-brand-800 ring-2 ring-brand-100"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-navy"
                        )}
                      >
                        <span
                          className="h-4 w-4 shrink-0 rounded-full ring-1 ring-slate-200"
                          style={{ backgroundColor: c.hex ?? "#ccc" }}
                          aria-hidden="true"
                        />
                        {c.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contador + limpiar */}
      {total > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Mostrando <span className="font-bold text-navy">{mostrados}</span> de{" "}
            <span className="font-semibold text-slate-600">{total}</span>
          </p>
          {nActivos > 0 && (
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-coral hover:text-coral"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {esIndiv
          ? productosFiltrados.map((p) => <ProductCard key={p.id} producto={p} />)
          : juegosFiltrados.map((j) => <SetCard key={j.id} juego={j} />)}
      </div>

      {/* Vacíos */}
      {total === 0 && (
        <p className="mt-8 rounded-xl bg-slate-50 p-8 text-center text-slate-500">
          No hay {(esIndiv ? labelIndividuales : labelJuegos).toLowerCase()} en esta categoría
          todavía.
        </p>
      )}

      {total > 0 && mostrados === 0 && (
        <div className="mt-8 rounded-xl bg-slate-50 p-8 text-center">
          <p className="text-slate-500">No hay resultados con los filtros aplicados.</p>
          <button
            type="button"
            onClick={limpiar}
            className="mt-3 inline-flex items-center rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
