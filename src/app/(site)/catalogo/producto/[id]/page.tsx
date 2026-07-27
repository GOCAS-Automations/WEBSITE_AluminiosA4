import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductoById } from "@/lib/data";
import { formatCOP, cm } from "@/lib/format";
import ColorViewer from "@/components/catalog/ColorViewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductoById(id);
  return { title: p?.nombre ?? "Producto" };
}

export default async function ProductoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProductoById(id);
  if (!p) notFound();

  const cat = (p as { categoria?: { nombre: string; slug: string } | null }).categoria ?? null;

  const specs: { label: string; value: string }[] = [];
  const d = cm(p.diametro_cm);
  const a = cm(p.altura_cm);
  if (d) specs.push({ label: "Diámetro", value: d });
  if (a) specs.push({ label: "Altura", value: a });
  if (p.capacidad) specs.push({ label: "Capacidad", value: p.capacidad });
  if (p.colores_manija) specs.push({ label: "Colores de manija", value: p.colores_manija });
  specs.push({ label: "Refuerzo", value: p.refuerzo ? "Sí" : "No" });
  if (p.empaque) specs.push({ label: "Empaque (caja)", value: p.empaque });
  if (p.referencia) specs.push({ label: "Referencia", value: p.referencia });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-slate-400">
        <Link href="/catalogo" className="hover:text-brand-700">Catálogo</Link>
        {cat && (
          <>
            <span className="mx-1.5">/</span>
            <Link href={`/catalogo/${cat.slug}`} className="hover:text-brand-700">{cat.nombre}</Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <span className="font-medium text-slate-600">{p.nombre}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ColorViewer base={p.imagen_url} colores={p.colores} alt={p.nombre} />

        <div>
          {p.refuerzo && (
            <span className="inline-block rounded-full bg-coral px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Con refuerzo
            </span>
          )}
          <h1 className="mt-3 text-3xl font-extrabold text-navy">{p.nombre}</h1>
          {p.descripcion && <p className="mt-3 text-slate-600">{p.descripcion}</p>}

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Precio unidad</p>
            <p className="text-3xl font-extrabold text-brand-700">{formatCOP(p.precio)}</p>
          </div>

          <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {specs.map((s) => (
              <div key={s.label} className="flex items-center justify-between px-4 py-3">
                <dt className="text-sm text-slate-500">{s.label}</dt>
                <dd className="text-sm font-semibold text-navy">{s.value}</dd>
              </div>
            ))}
          </dl>

          {p.qr_url && (
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.qr_url} alt={`QR ${p.nombre}`} className="h-24 w-24 object-contain" />
              <div>
                <p className="font-semibold text-navy">Código QR del producto</p>
                <p className="text-sm text-slate-500">
                  Escanéalo para realizar el pedido de esta referencia en el sistema de Aluminios A4.
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
