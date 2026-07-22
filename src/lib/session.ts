import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "a4_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export type Rol = "administrador" | "coordinador";

export interface SessionUser {
  uid: string;
  usuario: string;
  nombre: string;
  rol: Rol;
}

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-insecure-secret-change-me-please-0000000000"
);

/** Firma un JWT de sesión (HS256, 7 días). Edge-safe (jose). */
export async function signSession(u: SessionUser): Promise<string> {
  return new SignJWT({ usuario: u.usuario, nombre: u.nombre, rol: u.rol })
    .setSubject(u.uid)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/** Verifica y decodifica el JWT. Devuelve null si es inválido/expirado. */
export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return {
      uid: payload.sub,
      usuario: String(payload.usuario ?? ""),
      nombre: String(payload.nombre ?? ""),
      rol: (payload.rol as Rol) ?? "coordinador",
    };
  } catch {
    return null;
  }
}
