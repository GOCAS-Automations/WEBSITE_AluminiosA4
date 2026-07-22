import Link from "next/link";
import { getAllProductos } from "@/lib/admin/data";
import { formatCOP } from "@/lib/format";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function ProductosListPage() {
  const productos = (await getAllProductos()) as any[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Productos</h1>
          <p className="text-sm text-slate-500">{productos.length} ollas individuales</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          + Nuevo producto
        </Link>
      </div>

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
            {productos.map((p) => (
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
                    {p.destacado && <span className="rounded bg-coral-50 px-1.5 py-0.5 text-[10px] font-semibold text-coral-700">Destacado</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/productos/${p.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Aún no hay productos. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
