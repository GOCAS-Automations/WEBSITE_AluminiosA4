"use client";

import { useState } from "react";
import { cn } from "@/lib/format";
import ImageBox from "./ImageBox";

type C = { id: string; nombre: string; hex: string | null; imagen_url: string | null };

export default function ColorViewer({
  base,
  colores,
  alt,
}: {
  base: string | null;
  colores: C[];
  alt: string;
}) {
  const [idx, setIdx] = useState(0);
  const active = colores[idx];
  const img = active?.imagen_url || base;

  return (
    <div>
      <ImageBox
        src={img}
        alt={alt}
        className="aspect-square w-full rounded-3xl border border-slate-100 shadow-sm"
      />
      {colores.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Color de tapa
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {colores.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setIdx(i)}
                aria-pressed={i === idx}
                className={cn(
                  "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm transition",
                  i === idx
                    ? "border-navy bg-slate-50"
                    : "border-slate-200 hover:border-brand-300"
                )}
              >
                <span
                  className="h-7 w-7 rounded-full ring-1 ring-slate-200"
                  style={{ backgroundColor: c.hex ?? "#ccc" }}
                />
                <span className={cn("font-medium", i === idx ? "text-navy" : "text-slate-500")}>
                  {c.nombre}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
