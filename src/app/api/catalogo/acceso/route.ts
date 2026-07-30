import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  CATALOGO_COOKIE,
  CATALOGO_MAX_AGE,
  signCatalogoToken,
} from "@/lib/catalogo-acceso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Freno anti fuerza bruta: todo intento fallido cuesta ~500 ms. */
const RETARDO_FALLO_MS = 500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ERROR_GENERICO = "PIN incorrecto o inactivo.";

/**
 * Canjea un PIN por la cookie de acceso al catálogo.
 * El middleware excluye explícitamente esta ruta del gating.
 * Nunca devuelve el PIN ni la lista de PINes.
 */
export async function POST(req: Request) {
  let pin = "";
  try {
    const body = await req.json();
    pin = String(body?.pin ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!pin || pin.length > 64) {
    return NextResponse.json({ error: "Ingresa un PIN válido." }, { status: 400 });
  }

  const db = supabaseAdmin();
  // OJO: nada de `.ilike()` aquí. PostgREST traduce `*` a `%`, y en SQL LIKE
  // tanto `%` como `_` son comodines: un PIN que los contenga (p. ej.
  // "mi_pin*") haría match con valores que NO son ese PIN.
  // Los PINes son pocos (decenas), así que se comparan exactamente en JS.
  const { data: candidatos } = await db.from("catalogo_pines").select("*").eq("activo", true);

  const buscado = pin.toLowerCase();
  const fila = (candidatos ?? []).find(
    (r) => String(r.pin ?? "").trim().toLowerCase() === buscado
  );

  const expirado =
    Boolean(fila?.expira_at) && new Date(fila!.expira_at as string).getTime() < Date.now();

  if (!fila || expirado) {
    await sleep(RETARDO_FALLO_MS);
    return NextResponse.json({ error: ERROR_GENERICO }, { status: 401 });
  }

  // Métricas de uso (no bloquean el acceso si fallan).
  await db
    .from("catalogo_pines")
    .update({ usos: (fila.usos ?? 0) + 1, ultimo_acceso: new Date().toISOString() })
    .eq("id", fila.id);

  const token = await signCatalogoToken(String(fila.id));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CATALOGO_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CATALOGO_MAX_AGE,
  });
  return res;
}
