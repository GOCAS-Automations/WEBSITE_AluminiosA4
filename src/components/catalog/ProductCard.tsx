"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductoConColores } from "@/lib/types";
import { formatCOP, cm, cn } from "@/lib/format";
import ImageBox from "./ImageBox";

export default function ProductCard({ producto }: { producto: ProductoConColores }) {
  const colores = producto.colores ?? [];
  const [idx, setIdx] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);

  const activeColor = colores[idx];
  const img = activeColor?.imagen_url || producto.imagen_url || null;

  const specs: { label: string; value: string }[] = [];
  const d = cm(producto.diametro_cm);
  const a = cm(producto.altura_cm);
  if (d) specs.push({ label: "Ø Diámetro", value: d });
  if (a) specs.push({ label: "Altura", value: a });
  if (producto.capacidad) specs.push({ label: "Capacidad", value: producto.capacidad });

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* Imagen */}
      <div className="relative">
        <ImageBox src={img} alt={producto.nombre} className="aspect-[4/3] w-full" />

        {producto.refuerzo && (
          <span className="absolute left-3 top-3 rounded-full bg-coral px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            Con refuerzo
          </span>
        )}

        {producto.qr_url && (
          <button
            type="button"
            onClick={() => setQrOpen((v) => !v)}
            className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur hover:text-brand-700"
            aria-label="Ver código QR"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3M20 14v0M14 20h0M20 17v4" />
            </svg>
            QR
          </button>
        )}

        {qrOpen && producto.qr_url && (
          <button
            type="button"
            onClick={() => setQrOpen(false)}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/95 p-4 backdrop-blur"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={producto.qr_url} alt={`QR ${producto.nombre}`} className="h-32 w-32 object-contain" />
            <span className="text-xs font-medium text-slate-500">Escanea para ver el producto</span>
          </button>
        )}
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-tight text-navy">{producto.nombre}</h3>
          {producto.referencia && (
            <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              {producto.referencia}
            </span>
          )}
        </div>

        {/* Colores de tapa */}
        {colores.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Color de tapa
            </p>
            <div className="flex items-center gap-2">
              {colores.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  title={c.nombre}
                  aria-label={`Tapa ${c.nombre}`}
                  aria-pressed={i === idx}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-all",
                    i === idx
                      ? "scale-110 border-navy ring-2 ring-brand-200"
                      : "border-white ring-1 ring-slate-200 hover:scale-105"
                  )}
                  style={{ backgroundColor: c.hex ?? "#ccc" }}
                />
              ))}
              {activeColor && (
                <span className="text-xs font-medium text-slate-500">{activeColor.nombre}</span>
              )}
            </div>
          </div>
        )}

        {/* Especificaciones */}
        {specs.length > 0 && (
          <dl className="mt-3 grid grid-cols-3 gap-1.5">
            {specs.map((s) => (
              <div key={s.label} className="rounded-lg bg-slate-50 px-2 py-1.5 text-center">
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  {s.label}
                </dt>
                <dd className="text-xs font-bold text-navy">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Empaque */}
        {producto.empaque && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 8 12 3 3 8l9 5 9-5Z" />
              <path d="M3 8v8l9 5 9-5V8M12 13v8" />
            </svg>
            Empaque: <span className="font-semibold text-slate-600">{producto.empaque}</span>
          </p>
        )}

        {/* Precio + acción */}
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Precio</p>
            <p className="text-xl font-extrabold text-brand-700">{formatCOP(producto.precio)}</p>
          </div>
          <Link
            href={`/catalogo/producto/${producto.id}`}
            className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}
