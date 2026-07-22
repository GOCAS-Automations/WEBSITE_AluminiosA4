"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { strOrNull, boolFrom } from "@/lib/admin/form";

const ROLES = ["administrador", "coordinador"];

export async function saveUsuario(formData: FormData) {
  await requireAdmin();
  const db = supabaseAdmin();
  const id = strOrNull(formData.get("id"));

  const usuario = String(formData.get("usuario") ?? "").trim().toLowerCase();
  const nombre = String(formData.get("nombre") ?? "").trim();
  let rol = String(formData.get("rol") ?? "coordinador");
  if (!ROLES.includes(rol)) rol = "coordinador";
  const activo = boolFrom(formData.get("activo"));
  const email = strOrNull(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!usuario || !nombre) return;

  const base = { usuario, nombre, rol, activo, email };

  if (id) {
    const patch: Record<string, unknown> = { ...base };
    if (password) patch.password_hash = await hashPassword(password);
    await db.from("usuarios").update(patch).eq("id", id);
  } else {
    if (!password) return;
    await db.from("usuarios").insert({ ...base, password_hash: await hashPassword(password) });
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function deleteUsuario(formData: FormData) {
  const session = await requireAdmin();
  const id = strOrNull(formData.get("id"));
  // No permitir auto-eliminación
  if (id && id !== session.uid) {
    await supabaseAdmin().from("usuarios").delete().eq("id", id);
  }
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}
