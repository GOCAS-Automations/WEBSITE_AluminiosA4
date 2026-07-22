"use client";

import { useState } from "react";
import Link from "next/link";
import type { JuegoConDetalle } from "@/lib/types";
import { formatCOP, cn } from "@/lib/format";
import ImageBox from "./ImageBox";

export default function SetCard({ juego }: { juego: JuegoConDetalle }) {
  const colores = juego.colores ?? [];
  const [idx, setIdx] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);

  const activeColor = colores[idx];
  const img = activeColor?.imagen_url || juego.imagen_url || null;
  const piezas = juego.componentes?.reduce((n, c) => n + (c.cantidad ?? 1), 0) ?? 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm ring-1 ring-brand-50 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <ImageBox src={img} alt={juego.nombre} className="aspect-[4/3] w-full" />

        <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          Juego · {piezas || juego.componentes.length} piezas
        </span>

        {juego.qr_url && (
          <button
            type="button"
            onClick={() => setQrOpen((v) => !v)}
            className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur hover:text-brand-700"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3M20 17v4" />
            </svg>
            QR
          </button>
        )}

        {qrOpen && juego.qr_url && (
          <button
            type="button"
            onClick={() => setQrOpen(false)}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/95 p-4 backdrop-blur"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={juego.qr_url} alt={`QR ${juego.nombre}`} className="h-32 w-32 object-contain" />
            <span className="text-xs font-medium text-slate-500">Escanea para ver el juego</span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-tight text-navy">{juego.nombre}</h3>
          {juego.refuerzo && (
            <span className="mt-0.5 shrink-0 rounded-full bg-coral px-2 py-0.5 text-[9px] font-bold uppercase text-white">
              Refuerzo
            </span>
          )}
        </div>

        {/* Componentes */}
        {juego.componentes.length > 0 && (
          <div className="mt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Incluye</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {juego.componentes.map((c) => (
                <li
                  key={c.producto.id}
                  className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800"
                >
                  {c.cantidad > 1 ? `${c.cantidad}× ` : ""}
                  {c.producto.nombre}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Colores */}
        {colores.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tapa</span>
            {colores.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setIdx(i)}
                title={c.nombre}
                aria-label={`Tapa ${c.nombre}`}
                aria-pressed={i === idx}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition-all",
                  i === idx ? "scale-110 border-navy ring-2 ring-brand-200" : "border-white ring-1 ring-slate-200"
                )}
                style={{ backgroundColor: c.hex ?? "#ccc" }}
              />
            ))}
          </div>
        )}

        {juego.empaque && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 8 12 3 3 8l9 5 9-5Z" />
              <path d="M3 8v8l9 5 9-5V8M12 13v8" />
            </svg>
            Empaque: <span className="font-semibold text-slate-600">{juego.empaque}</span>
          </p>
        )}

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Precio del juego</p>
            <p className="text-xl font-extrabold text-brand-700">{formatCOP(juego.precio)}</p>
          </div>
          <Link
            href={`/catalogo/juego/${juego.id}`}
            className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}
