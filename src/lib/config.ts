import { cache } from "react";
import { supabasePublic } from "./supabase";

/**
 * Contenido editable del sitio público (tabla `configuracion`, una sola fila).
 * Se edita desde el panel en /admin/configuracion (administrador y coordinador).
 */
export interface SiteConfig {
  telefono_contacto: string;
  whatsapp_numero: string;
  whatsapp_mensaje: string;
  email_contacto: string;
  direccion_linea1: string;
  direccion_linea2: string;
  maps_query: string;
  hero_titulo: string;
  hero_subtitulo: string;
  hero_imagen_url: string;
  mostrar_franja_confianza: boolean;
  mostrar_destacados: boolean;
  mostrar_nosotros: boolean;
  mostrar_ubicacion: boolean;
}

/** Valores por defecto: deben coincidir con los DEFAULT de la tabla en schema-gocas.sql. */
export const DEFAULT_CONFIG: SiteConfig = {
  telefono_contacto: "+57 350 822 8479",
  whatsapp_numero: "573508228479",
  whatsapp_mensaje:
    "Hola, Aluminios A4 👋. Quisiera solicitar información sobre sus productos.",
  email_contacto: "ventas@aluminiosa4.com",
  direccion_linea1: "Cl. 36 #4-19, Comuna 4",
  direccion_linea2: "Cali, Valle del Cauca, Colombia",
  maps_query: "Aluminios A4, Cl. 36 #4-19, Cali, Valle del Cauca",
  hero_titulo: "100% Aluminio de Calidad",
  hero_subtitulo:
    "Fabricamos ollas, calderos y utensilios en aluminio resistente y duradero. Descubre nuestro catálogo de ollas individuales y juegos completos.",
  hero_imagen_url: "/hero-a4.png",
  mostrar_franja_confianza: true,
  mostrar_destacados: true,
  mostrar_nosotros: true,
  mostrar_ubicacion: true,
};

const CAMPOS = Object.keys(DEFAULT_CONFIG) as (keyof SiteConfig)[];

/** Mezcla la fila de BD con los defaults: campos vacíos/nulos caen al default. */
function merge(row: Record<string, unknown> | null | undefined): SiteConfig {
  if (!row) return { ...DEFAULT_CONFIG };
  const out = { ...DEFAULT_CONFIG };
  for (const k of CAMPOS) {
    const v = row[k];
    if (typeof DEFAULT_CONFIG[k] === "boolean") {
      if (typeof v === "boolean") (out[k] as boolean) = v;
    } else if (typeof v === "string" && v.trim() !== "") {
      (out[k] as string) = v;
    }
  }
  return out;
}

/**
 * Lee la configuración del sitio. Nunca lanza: ante cualquier fallo (sin fila,
 * sin conexión, tabla inexistente) devuelve DEFAULT_CONFIG para que el sitio
 * público siga renderizando. Cacheado por request (React `cache`).
 */
export const getConfig = cache(async (): Promise<SiteConfig> => {
  try {
    const { data, error } = await supabasePublic
      .from("configuracion")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) return { ...DEFAULT_CONFIG };
    return merge(data as Record<string, unknown> | null);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
});

/** Enlace wa.me armado con el número de la configuración. */
export function waLinkConfig(cfg: SiteConfig, mensaje?: string): string {
  return `https://wa.me/${cfg.whatsapp_numero}?text=${encodeURIComponent(
    mensaje ?? cfg.whatsapp_mensaje
  )}`;
}

/** Enlace de búsqueda en Google Maps a partir de `maps_query`. */
export function mapsSearchUrl(cfg: SiteConfig): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    cfg.maps_query
  )}`;
}

/** Enlace del iframe embebido de Google Maps. */
export function mapsEmbedUrl(cfg: SiteConfig): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    cfg.maps_query
  )}&z=16&output=embed`;
}

/** `tel:` a partir del teléfono visible (quita espacios y separadores). */
export function telHref(telefono: string): string {
  return `tel:${telefono.replace(/[^\d+]/g, "")}`;
}
