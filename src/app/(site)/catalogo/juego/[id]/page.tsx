import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJuegoById } from "@/lib/data";
import { formatCOP, cm } from "@/lib/format";
import ColorViewer from "@/components/catalog/ColorViewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const j = await getJuegoById(id);
  return { title: j?.nombre ?? "Juego" };
}

export default async function JuegoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const j = await getJuegoById(id);
  if (!j) notFound();

  const cat = (j as { categoria?: { nombre: string; slug: string } | null }).categoria ?? null;
  const piezas = j.componentes.reduce((n, c) => n + (c.cantidad ?? 1), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-slate-400">
        <Link href="/catalogo" className="hover:text-brand-700">Catálogo</Link>
        {cat && (
          <>
            <span className="mx-1.5">/</span>
            <Link href={`/catalogo/${cat.slug}?tipo=juegos`} className="hover:text-brand-700">{cat.nombre}</Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <span className="font-medium text-slate-600">{j.nombre}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ColorViewer base={j.imagen_url} colores={j.colores} alt={j.nombre} />

        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Juego · {piezas} piezas
            </span>
            {j.refuerzo && (
              <span className="inline-block rounded-full bg-coral px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Con refuerzo
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-extrabold text-navy">{j.nombre}</h1>
          {j.descripcion && <p className="mt-3 text-slate-600">{j.descripcion}</p>}

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Precio del juego</p>
            <p className="text-3xl font-extrabold text-brand-700">{formatCOP(j.precio)}</p>
            {j.empaque && <p className="mt-1 text-sm text-slate-500">Empaque: {j.empaque}</p>}
          </div>

          {/* Ollas que componen el juego */}
          {j.componentes.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-bold text-navy">Este juego incluye</h2>
              <ul className="space-y-2">
                {j.componentes.map((c) => (
                  <li key={c.producto.id}>
                    <Link
                      href={`/catalogo/producto/${c.producto.id}`}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                          {c.cantidad}×
                        </span>
                        <span>
                          <span className="block font-semibold text-navy">{c.producto.nombre}</span>
                          <span className="block text-xs text-slate-500">
                            {[cm(c.producto.diametro_cm), c.producto.capacidad].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-slate-500">
                        {formatCOP(c.producto.precio)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {j.qr_url && (
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={j.qr_url} alt={`QR ${j.nombre}`} className="h-24 w-24 object-contain" />
              <div>
                <p className="font-semibold text-navy">Código QR del juego</p>
                <p className="text-sm text-slate-500">
                  Escanéalo para realizar el pedido de este juego en el sistema de Aluminios A4.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8">
            <Link href="/catalogo" className="text-sm font-semibold text-brand-700 hover:underline">
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
