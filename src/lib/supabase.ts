import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "catalogo";

if (!url || !anon) {
  // Se avisa en consola, pero no rompe el build.
  console.warn("[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Cliente público (anon). Respeta RLS: solo lectura del catálogo. */
export const supabasePublic: SupabaseClient = createClient(url ?? "", anon ?? "", {
  auth: { persistSession: false },
});

/**
 * Cliente de administración (service role). SOLO en el servidor.
 * Bypassa RLS: se usa para login, CRUD y subida de imágenes.
 */
export function supabaseAdmin(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  if (!key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local. Pégala desde Supabase → Project Settings → API → service_role."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/** ¿Está configurada la service role key? (para mostrar avisos en la UI) */
export function hasServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** URL pública de un objeto del bucket a partir de su ruta. */
export function publicUrl(path: string): string {
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}
