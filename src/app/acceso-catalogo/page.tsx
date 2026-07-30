import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { getConfig, waLinkConfig } from "@/lib/config";
import PinGate from "./PinGate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo para clientes",
  robots: { index: false, follow: false },
};

/**
 * Lightbox de acceso al catálogo. El middleware hace *rewrite* aquí cuando
 * alguien pide /catalogo… sin cookie válida: la URL del navegador sigue siendo
 * la del catálogo y la página real nunca se renderiza (los precios de mayorista
 * no llegan al cliente). Vive fuera del grupo (site) para no arrastrar
 * header/footer, que ya enlazarían al catálogo.
 */
export default async function AccesoCatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  // Solo se admite volver al catálogo: evita open redirect.
  const raw = sp?.next ?? "";
  const next = raw.startsWith("/catalogo") ? raw : "/catalogo";

  const cfg = await getConfig();
  const waHref = waLinkConfig(
    cfg,
    "Hola, Aluminios A4 👋. Quisiera solicitar un PIN para ver el catálogo."
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center a4-waves px-4 py-10">
      <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex justify-center">
          <Logo size={44} />
        </div>

        <h1 className="mt-6 text-center text-2xl font-extrabold text-navy">
          Catálogo para clientes
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
          Nuestro catálogo con precios está reservado para clientes de Aluminios A4.
          Ingresa el PIN que te compartimos para verlo.
        </p>

        <PinGate next={next} waHref={waHref} />
      </div>
    </div>
  );
}
