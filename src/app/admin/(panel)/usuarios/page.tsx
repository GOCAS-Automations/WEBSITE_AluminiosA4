import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllUsuarios } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function UsuariosListPage() {
  const session = await requireAdmin();
  const usuarios = await getAllUsuarios();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Usuarios</h1>
          <p className="text-sm text-slate-500">{usuarios.length} cuentas</p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          + Nuevo usuario
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Último acceso</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-navy">
                        {u.nombre}
                        {u.id === session.uid && (
                          <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">tú</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">@{u.usuario}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                      u.rol === "administrador" ? "bg-navy text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {u.rol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${u.activo ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {u.last_login ? new Date(u.last_login).toLocaleDateString("es-CO") : "Nunca"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/usuarios/${u.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
