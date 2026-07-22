"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/upload-client";
import { cn } from "@/lib/format";

export type ColorRow = { nombre: string; hex: string; imagen_url: string };

const PRESETS = [
  { nombre: "Rojo", hex: "#e23b33" },
  { nombre: "Azul", hex: "#2450c4" },
  { nombre: "Verde", hex: "#2e9e5b" },
  { nombre: "Negro", hex: "#222222" },
];

export default function ColoresEditor({
  name,
  defaultValue = [],
  folder = "productos",
}: {
  name: string;
  defaultValue?: ColorRow[];
  folder?: string;
}) {
  const [rows, setRows] = useState<ColorRow[]>(defaultValue);
  const [busy, setBusy] = useState<number | null>(null);

  const update = (i: number, patch: Partial<ColorRow>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));
  const add = (preset?: { nombre: string; hex: string }) =>
    setRows((rs) => [...rs, { nombre: preset?.nombre ?? "", hex: preset?.hex ?? "#e23b33", imagen_url: "" }]);

  async function onFile(i: number, file?: File) {
    if (!file) return;
    setBusy(i);
    try {
      const url = await uploadImage(file, folder);
      update(i, { imagen_url: url });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="h-9 w-9 shrink-0 rounded-full ring-1 ring-slate-200"
                style={{ backgroundColor: r.hex || "#ccc" }}
              />
              <input
                value={r.nombre}
                onChange={(e) => update(i, { nombre: e.target.value })}
                placeholder="Nombre (ej. Rojo)"
                className="w-32 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
              />
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(r.hex) ? r.hex : "#e23b33"}
                onChange={(e) => update(i, { hex: e.target.value })}
                className="h-9 w-10 cursor-pointer rounded border border-slate-200"
                title="Color"
              />
              <input
                value={r.hex}
                onChange={(e) => update(i, { hex: e.target.value })}
                className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
              />

              <label className="cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-brand-400 hover:text-brand-700">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(i, e.target.files?.[0])} />
                {busy === i ? "Subiendo…" : r.imagen_url ? "Cambiar foto" : "Subir foto tapa"}
              </label>

              {r.imagen_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.imagen_url} alt="" className="h-9 w-9 rounded-lg border border-slate-200 object-contain" />
              )}

              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-auto rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:text-red-600"
              >
                Quitar
              </button>
            </div>
            <input
              value={r.imagen_url}
              onChange={(e) => update(i, { imagen_url: e.target.value })}
              placeholder="…o pega la URL de la foto con esta tapa"
              className="mt-2 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 outline-none focus:border-brand-500"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Agregar:</span>
        {PRESETS.map((p) => (
          <button
            key={p.nombre}
            type="button"
            onClick={() => add(p)}
            className={cn("flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-navy hover:border-brand-300")}
          >
            <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: p.hex }} />
            {p.nombre}
          </button>
        ))}
        <button
          type="button"
          onClick={() => add()}
          className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:border-brand-300"
        >
          + Otro
        </button>
      </div>
    </div>
  );
}
