import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type SessionUser } from "./session";

/** Lee la sesión desde la cookie (server components / actions). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

/** Exige sesión; redirige a login si no hay. */
export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

/** Exige rol administrador; redirige si no lo es. */
export async function requireAdmin(): Promise<SessionUser> {
  const s = await requireSession();
  if (s.rol !== "administrador") redirect("/admin");
  return s;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
