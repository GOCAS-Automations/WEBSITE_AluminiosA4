"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPassword } from "@/lib/auth";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!usuario || !password) return { error: "Ingresa tu usuario y contraseña." };

  let db;
  try {
    db = supabaseAdmin();
  } catch {
    return {
      error:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY en web/.env.local para poder iniciar sesión.",
    };
  }

  const { data: user } = await db
    .from("usuarios")
    .select("*")
    .eq("usuario", usuario)
    .eq("activo", true)
    .maybeSingle();

  if (!user) return { error: "Usuario o contraseña incorrectos." };

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return { error: "Usuario o contraseña incorrectos." };

  await db.from("usuarios").update({ last_login: new Date().toISOString() }).eq("id", user.id);

  const token = await signSession({
    uid: user.id,
    usuario: user.usuario,
    nombre: user.nombre,
    rol: user.rol,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
