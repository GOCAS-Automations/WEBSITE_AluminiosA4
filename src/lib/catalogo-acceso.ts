import { SignJWT, jwtVerify } from "jose";

/**
 * Acceso al catálogo por PIN.
 *
 * El catálogo muestra precios de mayorista, así que no puede ser público.
 * Quien acierta un PIN válido en /api/catalogo/acceso recibe esta cookie
 * firmada; el middleware la verifica en /catalogo* y /api/catalogo/*.
 *
 * Edge-safe (jose): se usa desde el middleware.
 */

export const CATALOGO_COOKIE = "a4_catalogo";
export const CATALOGO_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-insecure-secret-change-me-please-0000000000"
);

/** Firma un token de acceso al catálogo (HS256, 30 días). Subject = id del PIN. */
export async function signCatalogoToken(pinId: string): Promise<string> {
  return new SignJWT({})
    .setSubject(pinId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

/** true si la firma es válida y el token no expiró. Nunca lanza. */
export async function verifyCatalogoToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return Boolean(payload.sub);
  } catch {
    return false;
  }
}
