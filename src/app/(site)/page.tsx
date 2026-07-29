import Link from "next/link";
import { getCategoriasConConteo, getDestacadosProductos, getDestacadosJuegos } from "@/lib/data";
import { getConfig, waLinkConfig, mapsSearchUrl, mapsEmbedUrl } from "@/lib/config";
import ProductCard from "@/components/catalog/ProductCard";
import SetCard from "@/components/catalog/SetCard";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [cfg, categorias, productos, juegos] = await Promise.all([
    getConfig(),
    getCategoriasConConteo(),
    getDestacadosProductos(4),
    getDestacadosJuegos(2),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden a4-waves">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-white/25">
              Hecho en Colombia 🇨🇴
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              {cfg.hero_titulo}
            </h1>
            <p className="mt-4 max-w-md text-base text-white/90 sm:text-lg">
              {cfg.hero_subtitulo}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-sm transition hover:bg-brand-50"
              >
                Ver catálogo
              </Link>
              <a
                href={waLinkConfig(cfg)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2 inline-block align-text-bottom" aria-hidden="true">
                  <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a10 10 0 0 0 4.9 1.25h.01c5.52 0 10-4.48 10-10S17.56 2 12.04 2Zm5.85 14.24c-.25.7-1.23 1.28-2.02 1.45-.55.11-1.26.2-3.66-.79-2.66-1.1-4.5-3.7-4.63-3.87-.13-.17-1.1-1.47-1.1-2.8s.68-1.98.93-2.25c.24-.27.53-.34.71-.34.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.57.81 1.98.88 2.13.07.14.11.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.27.71 1.17 1.53 1.89 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.05.16-.18.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.27.14.44.2.5.31.07.13.07.7-.18 1.39Z" />
                </svg>
                Contáctanos
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto aspect-square w-full max-w-md rounded-[2rem] bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cfg.hero_imagen_url}
                alt="Chocolateras Aluminios A4"
                className="h-full w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      {cfg.mostrar_franja_confianza && (
        <section className="border-b border-slate-100 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
            {[
              { t: "100% Aluminio", d: "Material de alta calidad y resistencia" },
              { t: "Con refuerzo", d: "Mayor durabilidad en cada pieza" },
              { t: "Hecho en Colombia", d: "Producción y calidad nacional" },
            ].map((f) => (
              <div key={f.t} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-navy">{f.t}</p>
                  <p className="text-sm text-slate-500">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">Explora por categoría</h2>
            <p className="mt-1 text-slate-500">Elige una categoría y luego ollas individuales o juegos.</p>
          </div>
          <Link href="/catalogo" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">
            Ver todo →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={`/catalogo/${c.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
                {c.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imagen_url} alt={c.nombre} className="h-full w-full object-cover" />
                ) : (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M4 9h16l-1 9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 9Z" />
                    <path d="M3 9h18M8 9V6h8v3" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-navy">{c.nombre}</h3>
                <p className="text-xs text-slate-500">
                  {c.total_productos} individuales · {c.total_juegos} juegos
                </p>
              </div>
              <span className="text-brand-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      {cfg.mostrar_destacados && (productos.length > 0 || juegos.length > 0) && (
        <section className="bg-slate-50/70">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">Productos destacados</h2>
            <p className="mt-1 text-slate-500">Una muestra de lo que fabricamos.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {juegos.map((j) => (
                <SetCard key={j.id} juego={j} showPrice={false} waPhone={cfg.whatsapp_numero} />
              ))}
              {productos.map((p) => (
                <ProductCard key={p.id} producto={p} showPrice={false} waPhone={cfg.whatsapp_numero} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NOSOTROS */}
      {cfg.mostrar_nosotros && (
        <section id="nosotros" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-coral">Nosotros</span>
              <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
                Tradición y calidad en cada pieza
              </h2>
              <p className="mt-4 text-slate-600">
                En <strong className="text-navy">Aluminios A4</strong> fabricamos utensilios de cocina
                en aluminio 100% de calidad. Nuestras ollas y calderos están diseñados para durar,
                con opciones de refuerzo y tapas en distintos colores.
              </p>
              <p className="mt-3 text-slate-600">
                Trabajamos con estándares de calidad para hogares y negocios en toda Colombia.
              </p>
              <Link
                href="/catalogo"
                className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                Explorar el catálogo
              </Link>
            </div>
            <div className="rounded-3xl a4-waves p-8">
              <div className="grid grid-cols-2 gap-4 text-center text-white">
                {[
                  { n: "100%", l: "Aluminio" },
                  { n: "+5", l: "Líneas de producto" },
                  { n: "🇨🇴", l: "Hecho en Colombia" },
                  { n: "★★★★★", l: "Calidad garantizada" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20">
                    <p className="text-2xl font-extrabold">{s.n}</p>
                    <p className="text-xs text-white/85">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* UBICACIÓN */}
      {cfg.mostrar_ubicacion && (
        <section id="ubicacion" className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-coral">Ubicación</span>
                <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">Visítanos en Cali</h2>
                <p className="mt-4 text-slate-600">
                  Estamos en Cali, Valle del Cauca. Acércate a conocer nuestros productos en aluminio.
                </p>
                <p className="mt-5 flex items-start gap-2 text-slate-700">
                  <svg className="mt-0.5 shrink-0 text-brand-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <span>
                    <strong className="text-navy">{cfg.direccion_linea1}</strong><br />
                    {cfg.direccion_linea2}
                  </span>
                </p>
                <a
                  href={mapsSearchUrl(cfg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  Abrir en Google Maps →
                </a>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <iframe
                  title="Ubicación de Aluminios A4 en Cali"
                  src={mapsEmbedUrl(cfg)}
                  width="100%"
                  height="380"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
