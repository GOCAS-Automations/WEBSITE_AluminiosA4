import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoriaBySlug,
  getProductosByCategoria,
  getJuegosByCategoria,
} from "@/lib/data";
import { getConfig } from "@/lib/config";
import CatalogoFiltrado from "@/components/catalog/CatalogoFiltrado";

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

  const [productos, juegos, cfg] = await Promise.all([
    getProductosByCategoria(cat.id),
    getJuegosByCategoria(cat.id),
    getConfig(),
  ]);

  // Etiquetas de las pestañas según la categoría actual.
  // "Calderos" → "Calderos individuales" / "Juegos de calderos"
  // "Jarras y Jarros" → "Jarras y jarros individuales" / "Juegos de jarras y jarros"
  const nom = cat.nombre;
  const nomLower = nom.toLowerCase();
  const nomTab = nom.trim().includes(" ")
    ? nom.charAt(0).toUpperCase() + nomLower.slice(1)
    : nom;
  const labelIndividuales = `${nomTab} individuales`;
  const labelJuegos = `Juegos de ${nomLower}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/" className="hover:text-brand-700">Inicio</Link>
        <span className="mx-1.5">/</span>
        <Link href="/catalogo" className="hover:text-brand-700">Catálogo</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-slate-600">{cat.nombre}</span>
      </nav>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">{cat.nombre}</h1>
          {cat.descripcion && (
            <p className="mt-2 max-w-2xl text-slate-500">{cat.descripcion}</p>
          )}
        </div>

        <a
          href={`/api/catalogo/${cat.slug}/pdf`}
          download
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          </svg>
          Descargar catálogo de {nomLower} en PDF
        </a>
      </div>

      <CatalogoFiltrado
        productos={productos}
        juegos={juegos}
        tipo={tipo}
        slug={cat.slug}
        labelIndividuales={labelIndividuales}
        labelJuegos={labelJuegos}
        waPhone={cfg.whatsapp_numero}
      />
    </div>
  );
}
