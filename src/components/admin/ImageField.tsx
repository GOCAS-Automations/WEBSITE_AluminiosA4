"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/upload-client";
import { cn } from "@/lib/format";

export default function ImageField({
  name,
  folder = "productos",
  defaultValue = "",
  label = "Imagen",
  help,
}: {
  name: string;
  folder?: string;
  defaultValue?: string;
  label?: string;
  help?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const u = await uploadImage(file, folder);
      setUrl(u);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Error al subir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-semibold text-navy">{label}</label>
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={cn("rounded-md px-2 py-1 font-semibold", mode === "upload" ? "bg-white text-navy shadow-sm" : "text-slate-500")}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn("rounded-md px-2 py-1 font-semibold", mode === "url" ? "bg-white text-navy shadow-sm" : "text-slate-500")}
          >
            Pegar URL
          </button>
        </div>
      </div>

      <input type="hidden" name={name} value={url} />

      <div className="flex items-start gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-slate-400">sin imagen</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {mode === "upload" ? (
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-700">
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              {busy ? "Subiendo…" : "Seleccionar imagen (se sube a Supabase)"}
            </label>
          ) : (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/…/foto.png"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          )}
          {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
          {help && !err && <p className="mt-1 text-xs text-slate-400">{help}</p>}
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="mt-1 text-xs font-medium text-slate-400 hover:text-red-600"
            >
              Quitar imagen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
