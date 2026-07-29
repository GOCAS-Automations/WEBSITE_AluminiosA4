"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductoConColores } from "@/lib/types";
import { formatCOP, cm, cn } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import ImageBox from "./ImageBox";

export default function ProductCard({
  producto,
  showPrice = true,
}: {
  producto: ProductoConColores;
  showPrice?: boolean;
}) {
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
            <span className="text-xs font-medium text-slate-500">
              Escanéalo con POSGOLD y realiza tu pedido en el sistema de Aluminios A4
            </span>
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
            {showPrice !== false &&
              producto.precio_empaque &&
              producto.precio_empaque !== producto.precio && (
                <>
                  {" "}
                  · <span className="font-semibold text-brand-700">{formatCOP(producto.precio_empaque)}</span> el
                  empaque
                </>
              )}
          </p>
        )}

        {producto.colores_manija && (
          <p className="mt-1.5 text-xs text-slate-500">
            Manija: <span className="font-semibold text-slate-600">{producto.colores_manija}</span>
          </p>
        )}

        {/* Precio + acción */}
        <div
          className={cn(
            "mt-auto flex items-end border-t border-slate-100 pt-3",
            showPrice !== false ? "justify-between" : "justify-end"
          )}
        >
          {showPrice !== false && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Precio</p>
              <p className="text-xl font-extrabold text-brand-700">{formatCOP(producto.precio)}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <a
              href={waLink(
                `Hola, Aluminios A4 👋. Quisiera información sobre la referencia ${producto.referencia ?? ""} — ${producto.nombre}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Consultar por WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition-colors hover:border-[#25D366]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a10 10 0 0 0 4.9 1.25h.01c5.52 0 10-4.48 10-10S17.56 2 12.04 2Zm5.85 14.24c-.25.7-1.23 1.28-2.02 1.45-.55.11-1.26.2-3.66-.79-2.66-1.1-4.5-3.7-4.63-3.87-.13-.17-1.1-1.47-1.1-2.8s.68-1.98.93-2.25c.24-.27.53-.34.71-.34.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.57.81 1.98.88 2.13.07.14.11.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.27.71 1.17 1.53 1.89 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.05.16-.18.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.27.14.44.2.5.31.07.13.07.7-.18 1.39Z" />
              </svg>
            </a>
            <Link
              href={`/catalogo/producto/${producto.id}`}
              className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
