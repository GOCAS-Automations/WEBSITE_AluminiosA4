import type { Metadata } from "next";
import Link from "next/link";
import { getCategoriasConConteo } from "@/lib/data";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora las categorías de productos en aluminio de Aluminios A4.",
};

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const categorias = await getCategoriasConConteo();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/" className="hover:text-brand-700">Inicio</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-slate-600">Catálogo</span>
      </nav>

      <h1 className="text-3xl font-extrabold text-navy">Catálogo</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Elige una categoría. Dentro podrás ver las <strong>ollas individuales</strong> o los{" "}
        <strong>juegos de ollas</strong>.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((c) => (
          <Link
            key={c.id}
            href={`/catalogo/${c.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
          >
            <div className="flex h-40 items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-white">
              {c.imagen_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imagen_url} alt={c.nombre} className="h-full w-full object-cover" />
              ) : (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.9">
                  <path d="M4 9h16l-1 9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 9Z" />
                  <path d="M3 9h18M8 9V6h8v3" />
                </svg>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-bold text-navy">{c.nombre}</h2>
              {c.descripcion && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.descripcion}</p>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                  {c.total_productos} individuales
                </span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
                  {c.total_juegos} juegos
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {categorias.length === 0 && (
        <p className="mt-10 rounded-xl bg-slate-50 p-6 text-center text-slate-500">
          Aún no hay categorías publicadas.
        </p>
      )}
    </div>
  );
}
