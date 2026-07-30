import Link from "next/link";
import { getAllPines } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

const fecha = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString("es-CO") : "Nunca";

export default async function PinesListPage() {
  const pines = await getAllPines();
  const ahora = Date.now();
  const expirado = (p: { expira_at?: string | null }) =>
    Boolean(p.expira_at) && new Date(p.expira_at as string).getTime() < ahora;
  const hayActivos = pines.some((p) => p.activo && !expirado(p));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Pines de catálogo</h1>
          <p className="text-sm text-slate-500">{pines.length} pines</p>
        </div>
        <Link
          href="/admin/pines/nuevo"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          + Nuevo PIN
        </Link>
      </div>

      <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Cualquiera con un PIN activo puede ver el catálogo con precios. Desactiva o elimina un PIN
        para revocar el acceso.
      </p>

      {!hayActivos && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          ⚠️ No hay PINes activos: nadie puede ver el catálogo.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">PIN</th>
              <th className="px-4 py-3 font-semibold">Etiqueta</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Usos</th>
              <th className="px-4 py-3 font-semibold">Último acceso</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pines.map((p) => {
              const venc = expirado(p);
              return (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-sm font-bold tracking-wider text-navy">
                      {p.pin}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.etiqueta || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          p.activo ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                      {venc && (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          Expirado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{p.usos ?? 0}</td>
                  <td className="px-4 py-3 text-slate-500">{fecha(p.ultimo_acceso)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pines/${p.id}`}
                      className="text-sm font-semibold text-brand-700 hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {pines.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Aún no hay PINes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
