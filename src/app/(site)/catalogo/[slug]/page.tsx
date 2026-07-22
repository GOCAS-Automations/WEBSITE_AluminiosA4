import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoriaBySlug,
  getProductosByCategoria,
  getJuegosByCategoria,
} from "@/lib/data";
import { cn } from "@/lib/format";
import ProductCard from "@/components/catalog/ProductCard";
import SetCard from "@/components/catalog/SetCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoriaBySlug(slug);
  return { title: cat?.nombre ?? "Categoría" };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { slug } = await params;
  const cat = await getCategoriaBySlug(slug);
  if (!cat) notFound();

  const sp = await searchParams;
  const tipo = sp?.tipo === "juegos" ? "juegos" : "individuales";

  const [productos, juegos] = await Promise.all([
    getProductosByCategoria(cat.id),
    getJuegosByCategoria(cat.id),
  ]);

  const tabs = [
    { key: "individuales", label: "Ollas individuales", count: productos.length },
    { key: "juegos", label: "Juegos de ollas", count: juegos.length },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/" className="hover:text-brand-700">Inicio</Link>
        <span className="mx-1.5">/</span>
        <Link href="/catalogo" className="hover:text-brand-700">Catálogo</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-slate-600">{cat.nombre}</span>
      </nav>

      <h1 className="text-3xl font-extrabold text-navy">{cat.nombre}</h1>
      {cat.descripcion && <p className="mt-2 max-w-2xl text-slate-500">{cat.descripcion}</p>}

      {/* Selector individuales / juegos */}
      <div className="mt-8 inline-flex rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/catalogo/${cat.slug}?tipo=${t.key}`}
            scroll={false}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
              tipo === t.key ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-navy"
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                tipo === t.key ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500"
              )}
            >
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tipo === "individuales"
          ? productos.map((p) => <ProductCard key={p.id} producto={p} />)
          : juegos.map((j) => <SetCard key={j.id} juego={j} />)}
      </div>

      {tipo === "individuales" && productos.length === 0 && (
        <EmptyState texto="No hay ollas individuales en esta categoría todavía." />
      )}
      {tipo === "juegos" && juegos.length === 0 && (
        <EmptyState texto="No hay juegos en esta categoría todavía." />
      )}
    </div>
  );
}

function EmptyState({ texto }: { texto: string }) {
  return (
    <p className="mt-8 rounded-xl bg-slate-50 p-8 text-center text-slate-500">{texto}</p>
  );
}
