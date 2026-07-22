"use client";

import { useState } from "react";
import { cn } from "@/lib/format";

type ProductoLite = { id: string; nombre: string; referencia: string | null };
type Comp = { producto_id: string; cantidad: number };

export default function ComponentesEditor({
  name,
  productos,
  defaultValue = [],
}: {
  name: string;
  productos: ProductoLite[];
  defaultValue?: Comp[];
}) {
  const [sel, setSel] = useState<Map<string, number>>(
    new Map(defaultValue.map((d) => [d.producto_id, d.cantidad ?? 1]))
  );

  const toggle = (id: string) =>
    setSel((m) => {
      const next = new Map(m);
      if (next.has(id)) next.delete(id);
      else next.set(id, 1);
      return next;
    });

  const setCant = (id: string, n: number) =>
    setSel((m) => {
      const next = new Map(m);
      next.set(id, Math.max(1, n || 1));
      return next;
    });

  const serialized = [...sel.entries()].map(([producto_id, cantidad], i) => ({
    producto_id,
    cantidad,
    orden: i,
  }));

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(serialized)} />
      <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 p-2">
        {productos.length === 0 && (
          <p className="p-3 text-sm text-slate-400">
            No hay productos individuales. Crea productos primero para poder armar un juego.
          </p>
        )}
        {productos.map((p) => {
          const checked = sel.has(p.id);
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition",
                checked ? "bg-brand-50" : "hover:bg-slate-50"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(p.id)}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="flex-1 text-sm font-medium text-navy">
                {p.nombre}
                {p.referencia && <span className="ml-1 text-xs text-slate-400">({p.referencia})</span>}
              </span>
              {checked && (
                <label className="flex items-center gap-1 text-xs text-slate-500">
                  Cant.
                  <input
                    type="number"
                    min={1}
                    value={sel.get(p.id) ?? 1}
                    onChange={(e) => setCant(p.id, parseInt(e.target.value, 10))}
                    className="w-14 rounded-md border border-slate-200 px-2 py-1 text-sm"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-slate-400">
        Selecciona las ollas individuales que componen este juego.
      </p>
    </div>
  );
}
