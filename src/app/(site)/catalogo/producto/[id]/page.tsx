import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductoById } from "@/lib/data";
import { formatCOP, cm } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
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
  if (p.precio_empaque && p.precio_empaque !== p.precio)
    specs.push({ label: "Precio por empaque", value: formatCOP(p.precio_empaque) });
  if (p.referencia) specs.push({ label: "Referencia", value: p.referencia });

  const waButton = (
    <a
      href={waLink(
        `Hola, Aluminios A4 👋. Quisiera información sobre la referencia ${p.referencia ?? ""} — ${p.nombre}.`
      )}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition hover:brightness-95 sm:w-auto"
      style={{ backgroundColor: "#25D366" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a10 10 0 0 0 4.9 1.25h.01c5.52 0 10-4.48 10-10S17.56 2 12.04 2Zm5.85 14.24c-.25.7-1.23 1.28-2.02 1.45-.55.11-1.26.2-3.66-.79-2.66-1.1-4.5-3.7-4.63-3.87-.13-.17-1.1-1.47-1.1-2.8s.68-1.98.93-2.25c.24-.27.53-.34.71-.34.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.57.81 1.98.88 2.13.07.14.11.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.27.71 1.17 1.53 1.89 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.05.16-.18.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.27.14.44.2.5.31.07.13.07.7-.18 1.39Z" />
      </svg>
      Consultar esta referencia por WhatsApp
    </a>
  );

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

          {!p.qr_url && waButton}

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
                  Escanéalo con POSGOLD para realizar el pedido de esta referencia en el sistema de Aluminios A4.
                </p>
              </div>
            </div>
          )}

          {p.qr_url && waButton}

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
