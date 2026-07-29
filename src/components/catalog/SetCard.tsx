"use client";

import { useState } from "react";
import Link from "next/link";
import type { JuegoConDetalle } from "@/lib/types";
import { formatCOP, cn } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import ImageBox from "./ImageBox";

export default function SetCard({
  juego,
  showPrice = true,
}: {
  juego: JuegoConDetalle;
  showPrice?: boolean;
}) {
  const colores = juego.colores ?? [];
  const [idx, setIdx] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);

  const activeColor = colores[idx];
  const img = activeColor?.imagen_url || juego.imagen_url || null;
  const piezas = juego.componentes?.reduce((n, c) => n + (c.cantidad ?? 1), 0) ?? 0;
  const piezasNombre = (() => {
    const m = juego.nombre?.match(/[x*](\d+)/i);
    return m ? parseInt(m[1], 10) : 0;
  })();
  const piezasFinal = piezas || piezasNombre;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm ring-1 ring-brand-50 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <ImageBox src={img} alt={juego.nombre} className="aspect-[4/3] w-full" />

        <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          {piezasFinal > 0 ? `Juego · ${piezasFinal} piezas` : "Juego"}
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
            <span className="text-xs font-medium text-slate-500">
              Escanéalo con POSGOLD y realiza tu pedido en el sistema de Aluminios A4
            </span>
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

        <div
          className={cn(
            "mt-auto flex items-end border-t border-slate-100 pt-3",
            showPrice !== false ? "justify-between" : "justify-end"
          )}
        >
          {showPrice !== false && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Precio del juego</p>
              <p className="text-xl font-extrabold text-brand-700">{formatCOP(juego.precio)}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <a
              href={waLink(
                `Hola, Aluminios A4 👋. Quisiera información sobre el juego ${juego.referencia ?? ""} — ${juego.nombre}.`
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
              href={`/catalogo/juego/${juego.id}`}
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
