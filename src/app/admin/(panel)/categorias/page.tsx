import Link from "next/link";
import { getAllCategorias } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function CategoriasListPage() {
  const categorias = await getAllCategorias();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Categorías</h1>
          <p className="text-sm text-slate-500">{categorias.length} categorías</p>
        </div>
        <Link
          href="/admin/categorias/nuevo"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          + Nueva categoría
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((c) => (
          <Link
            key={c.id}
            href={`/admin/categorias/${c.id}`}
            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
              {c.imagen_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imagen_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold">{c.nombre.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-navy">{c.nombre}</p>
              <p className="truncate text-xs text-slate-400">/{c.slug}</p>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                c.activo ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {c.activo ? "Visible" : "Oculto"}
            </span>
          </Link>
        ))}
        {categorias.length === 0 && (
          <p className="col-span-full rounded-xl bg-slate-50 p-8 text-center text-slate-400">
            Aún no hay categorías.
          </p>
        )}
      </div>
    </div>
  );
}
