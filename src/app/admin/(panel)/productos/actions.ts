"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import { strOrNull, toNum, boolFrom, parseJsonArray } from "@/lib/admin/form";

export async function saveProducto(formData: FormData) {
  await requireSession();
  const db = supabaseAdmin();
  const id = strOrNull(formData.get("id"));

  const payload = {
    nombre: String(formData.get("nombre") ?? "").trim(),
    referencia: strOrNull(formData.get("referencia")),
    categoria_id: strOrNull(formData.get("categoria_id")),
    descripcion: strOrNull(formData.get("descripcion")),
    diametro_cm: toNum(formData.get("diametro_cm")),
    altura_cm: toNum(formData.get("altura_cm")),
    capacidad: strOrNull(formData.get("capacidad")),
    colores_manija: strOrNull(formData.get("colores_manija")),
    refuerzo: boolFrom(formData.get("refuerzo")),
    empaque: strOrNull(formData.get("empaque")),
    precio: toNum(formData.get("precio")) ?? 0,
    precio_empaque: toNum(formData.get("precio_empaque")),
    imagen_url: strOrNull(formData.get("imagen_url")),
    qr_url: strOrNull(formData.get("qr_url")),
    destacado: boolFrom(formData.get("destacado")),
    activo: boolFrom(formData.get("activo")),
    orden: toNum(formData.get("orden")) ?? 0,
  };
  if (!payload.nombre) return;

  let productoId = id;
  if (id) {
    await db.from("productos").update(payload).eq("id", id);
  } else {
    const { data } = await db.from("productos").insert(payload).select("id").single();
    productoId = data?.id ?? null;
  }

  if (productoId) {
    const colores = parseJsonArray(formData.get("colores")).filter((c) => c?.nombre?.trim());
    await db.from("producto_colores").delete().eq("producto_id", productoId);
    if (colores.length) {
      await db.from("producto_colores").insert(
        colores.map((c, i) => ({
          producto_id: productoId,
          nombre: String(c.nombre).trim(),
          hex: c.hex || null,
          imagen_url: c.imagen_url || null,
          orden: i,
        }))
      );
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function deleteProducto(formData: FormData) {
  await requireSession();
  const id = strOrNull(formData.get("id"));
  if (id) await supabaseAdmin().from("productos").delete().eq("id", id);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/productos");
}
