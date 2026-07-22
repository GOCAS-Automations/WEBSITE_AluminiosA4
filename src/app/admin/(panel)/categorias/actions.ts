"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import { strOrNull, toNum, boolFrom } from "@/lib/admin/form";
import { slugify } from "@/lib/format";

export async function saveCategoria(formData: FormData) {
  await requireSession();
  const db = supabaseAdmin();
  const id = strOrNull(formData.get("id"));

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;
  const slug = slugify(String(formData.get("slug") ?? "").trim() || nombre) || slugify(nombre);

  const payload = {
    nombre,
    slug,
    descripcion: strOrNull(formData.get("descripcion")),
    imagen_url: strOrNull(formData.get("imagen_url")),
    orden: toNum(formData.get("orden")) ?? 0,
    activo: boolFrom(formData.get("activo")),
  };

  if (id) await db.from("categorias").update(payload).eq("id", id);
  else await db.from("categorias").insert(payload);

  revalidatePath("/admin/categorias");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/categorias");
}

export async function deleteCategoria(formData: FormData) {
  await requireSession();
  const id = strOrNull(formData.get("id"));
  if (id) await supabaseAdmin().from("categorias").delete().eq("id", id);
  revalidatePath("/admin/categorias");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/categorias");
}
