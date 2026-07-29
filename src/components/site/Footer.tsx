import Link from "next/link";
import Logo from "@/components/Logo";
import { mapsSearchUrl, telHref, waLinkConfig, type SiteConfig } from "@/lib/config";

export default function Footer({ cfg }: { cfg: SiteConfig }) {
  return (
    <footer id="contacto" className="mt-20 border-t border-slate-100 bg-navy text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Fabricantes de ollas, calderos y utensilios en aluminio de alta calidad.
            Hecho en Colombia. 100% aluminio.
          </p>
        </div>

        <div className="text-sm">
          <h3 className="mb-3 font-semibold text-white">Navegación</h3>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/" className="hover:text-brand-300">Inicio</Link></li>
            <li><Link href="/catalogo" className="hover:text-brand-300">Catálogo</Link></li>
            <li><Link href="/#nosotros" className="hover:text-brand-300">Nosotros</Link></li>
            <li><Link href="/admin" className="hover:text-brand-300">Acceso empleados</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <h3 className="mb-3 font-semibold text-white">Contacto</h3>
          <ul className="space-y-2 text-slate-400">
            <li>
              <a
                href={mapsSearchUrl(cfg)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-300"
              >
                {cfg.direccion_linea1}<br />{cfg.direccion_linea2}
              </a>
            </li>
            <li>
              <a href={`mailto:${cfg.email_contacto}`} className="hover:text-brand-300">
                {cfg.email_contacto}
              </a>
            </li>
            <li>
              <a href={telHref(cfg.telefono_contacto)} className="hover:text-brand-300">
                {cfg.telefono_contacto}
              </a>
            </li>
            <li>
              <a
                href={waLinkConfig(cfg)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-300"
              >
                WhatsApp: {cfg.telefono_contacto}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Aluminios A4 · 100% Aluminio de Calidad · Hecho en Colombia
      </div>
    </footer>
  );
}
