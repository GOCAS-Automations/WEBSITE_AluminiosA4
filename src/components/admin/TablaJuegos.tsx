"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCOP } from "@/lib/format";
import FiltrosBar, { normalizarTexto } from "./FiltrosBar";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function TablaJuegos({ juegos }: { juegos: any[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");

  const categorias = useMemo(() => {
    const set = new Set<string>();
    juegos.forEach((j) => {
      if (j.categoria?.nombre) set.add(j.categoria.nombre);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [juegos]);

  const filtrados = useMemo(() => {
    const q = normalizarTexto(busqueda);
    return juegos.filter((j) => {
      if (q) {
        const nombre = normalizarTexto(j.nombre ?? "");
        const referencia = normalizarTexto(j.referencia ?? "");
        if (!nombre.includes(q) && !referencia.includes(q)) return false;
      }
      if (categoria && j.categoria?.nombre !== categoria) return false;
      if (estado === "visibles" && !j.activo) return false;
      if (estado === "ocultos" && j.activo) return false;
      return true;
    });
  }, [juegos, busqueda, categoria, estado]);

  return (
    <>
      <FiltrosBar
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        categoria={categoria}
        onCategoriaChange={setCategoria}
        categorias={categorias}
        estado={estado}
        onEstadoChange={setEstado}
        mostrando={filtrados.length}
        total={juegos.length}
        onLimpiar={() => {
          setBusqueda("");
          setCategoria("");
          setEstado("");
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Juego</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Ollas</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtrados.map((j) => (
              <tr key={j.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                      {j.imagen_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={j.imagen_url} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[9px] text-slate-300">s/img</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-navy">{j.nombre}</p>
                      {j.referencia && <p className="text-xs text-slate-400">{j.referencia}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{j.categoria?.nombre ?? "—"}</td>
                <td className="px-4 py-3 font-semibold text-navy">{formatCOP(j.precio)}</td>
                <td className="px-4 py-3 text-slate-500">{j.componentes?.length ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        j.activo ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {j.activo ? "Visible" : "Oculto"}
                    </span>
                    {j.destacado && (
                      <span className="rounded bg-coral-50 px-1.5 py-0.5 text-[10px] font-semibold text-coral-700">
                        Destacado
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/juegos/${j.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  {juegos.length === 0
                    ? "Aún no hay juegos. Crea el primero."
                    : "Ningún juego coincide con los filtros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
