import Link from "next/link";
import { getAllJuegos } from "@/lib/admin/data";
import { formatCOP } from "@/lib/format";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function JuegosListPage() {
  const juegos = (await getAllJuegos()) as any[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Juegos de ollas</h1>
          <p className="text-sm text-slate-500">{juegos.length} juegos</p>
        </div>
        <Link
          href="/admin/juegos/nuevo"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          + Nuevo juego
        </Link>
      </div>

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
            {juegos.map((j) => (
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
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${j.activo ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {j.activo ? "Visible" : "Oculto"}
                    </span>
                    {j.destacado && <span className="rounded bg-coral-50 px-1.5 py-0.5 text-[10px] font-semibold text-coral-700">Destacado</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/juegos/${j.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {juegos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Aún no hay juegos. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
