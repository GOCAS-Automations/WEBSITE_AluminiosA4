"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import { boolFrom } from "@/lib/admin/form";
import { DEFAULT_CONFIG, type SiteConfig } from "@/lib/config";

/** Claves de texto de la configuración (excluye los toggles booleanos). */
type CampoTexto = {
  [K in keyof SiteConfig]: SiteConfig[K] extends string ? K : never;
}[keyof SiteConfig];

/** Texto del form; si queda vacío se vuelve al valor por defecto del sitio. */
function texto(fd: FormData, campo: CampoTexto): string {
  const v = String(fd.get(campo) ?? "").trim();
  return v === "" ? DEFAULT_CONFIG[campo] : v;
}

/**
 * Guarda la configuración del sitio público.
 * Accesible para administrador Y coordinador (requireSession, no requireAdmin).
 */
export async function saveConfiguracion(formData: FormData) {
  await requireSession();

  // WhatsApp: solo dígitos (el usuario puede pegar "+57 350 822 8479").
  const soloDigitos = String(formData.get("whatsapp_numero") ?? "").replace(/\D/g, "");
  const whatsapp_numero =
    soloDigitos.length >= 10 && soloDigitos.length <= 15
      ? soloDigitos
      : DEFAULT_CONFIG.whatsapp_numero;

  const payload = {
    id: true,
    telefono_contacto: texto(formData, "telefono_contacto"),
    whatsapp_numero,
    whatsapp_mensaje: texto(formData, "whatsapp_mensaje"),
    email_contacto: texto(formData, "email_contacto"),
    direccion_linea1: texto(formData, "direccion_linea1"),
    direccion_linea2: texto(formData, "direccion_linea2"),
    maps_query: texto(formData, "maps_query"),
    hero_titulo: texto(formData, "hero_titulo"),
    hero_subtitulo: texto(formData, "hero_subtitulo"),
    hero_imagen_url: texto(formData, "hero_imagen_url"),
    mostrar_franja_confianza: boolFrom(formData.get("mostrar_franja_confianza")),
    mostrar_destacados: boolFrom(formData.get("mostrar_destacados")),
    mostrar_nosotros: boolFrom(formData.get("mostrar_nosotros")),
    mostrar_ubicacion: boolFrom(formData.get("mostrar_ubicacion")),
  };

  await supabaseAdmin().from("configuracion").upsert(payload, { onConflict: "id" });

  // El footer y el botón flotante viven en el layout del sitio.
  revalidatePath("/", "layout");
  revalidatePath("/catalogo");
  revalidatePath("/admin/configuracion");
  redirect("/admin/configuracion?ok=1");
}
