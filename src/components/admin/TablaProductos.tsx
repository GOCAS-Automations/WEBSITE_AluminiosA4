"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCOP } from "@/lib/format";
import FiltrosBar, { normalizarTexto } from "./FiltrosBar";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function TablaProductos({ productos }: { productos: any[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");

  const categorias = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      if (p.categoria?.nombre) set.add(p.categoria.nombre);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [productos]);

  const filtrados = useMemo(() => {
    const q = normalizarTexto(busqueda);
    return productos.filter((p) => {
      if (q) {
        const nombre = normalizarTexto(p.nombre ?? "");
        const referencia = normalizarTexto(p.referencia ?? "");
        if (!nombre.includes(q) && !referencia.includes(q)) return false;
      }
      if (categoria && p.categoria?.nombre !== categoria) return false;
      if (estado === "visibles" && !p.activo) return false;
      if (estado === "ocultos" && p.activo) return false;
      return true;
    });
  }, [productos, busqueda, categoria, estado]);

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
        total={productos.length}
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
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Colores</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtrados.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                      {p.imagen_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imagen_url} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[9px] text-slate-300">s/img</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-navy">{p.nombre}</p>
                      {p.referencia && <p className="text-xs text-slate-400">{p.referencia}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.categoria?.nombre ?? "—"}</td>
                <td className="px-4 py-3 font-semibold text-navy">{formatCOP(p.precio)}</td>
                <td className="px-4 py-3 text-slate-500">{p.colores?.length ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge on={p.activo} labelOn="Visible" labelOff="Oculto" />
                    {p.destacado && (
                      <span className="rounded bg-coral-50 px-1.5 py-0.5 text-[10px] font-semibold text-coral-700">
                        Destacado
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/productos/${p.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  {productos.length === 0
                    ? "Aún no hay productos. Crea el primero."
                    : "Ningún producto coincide con los filtros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Badge({ on, labelOn, labelOff }: { on: boolean; labelOn: string; labelOff: string }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
        on ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {on ? labelOn : labelOff}
    </span>
  );
}
