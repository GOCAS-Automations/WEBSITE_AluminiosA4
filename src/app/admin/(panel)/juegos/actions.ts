"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import { strOrNull, toNum, boolFrom, parseJsonArray } from "@/lib/admin/form";

export async function saveJuego(formData: FormData) {
  await requireSession();
  const db = supabaseAdmin();
  const id = strOrNull(formData.get("id"));

  const payload = {
    nombre: String(formData.get("nombre") ?? "").trim(),
    referencia: strOrNull(formData.get("referencia")),
    categoria_id: strOrNull(formData.get("categoria_id")),
    descripcion: strOrNull(formData.get("descripcion")),
    refuerzo: boolFrom(formData.get("refuerzo")),
    empaque: strOrNull(formData.get("empaque")),
    precio: toNum(formData.get("precio")) ?? 0,
    imagen_url: strOrNull(formData.get("imagen_url")),
    qr_url: strOrNull(formData.get("qr_url")),
    destacado: boolFrom(formData.get("destacado")),
    activo: boolFrom(formData.get("activo")),
    orden: toNum(formData.get("orden")) ?? 0,
  };
  if (!payload.nombre) return;

  let juegoId = id;
  if (id) {
    await db.from("juegos").update(payload).eq("id", id);
  } else {
    const { data } = await db.from("juegos").insert(payload).select("id").single();
    juegoId = data?.id ?? null;
  }

  if (juegoId) {
    // Colores de tapa del juego
    const colores = parseJsonArray(formData.get("colores")).filter((c) => c?.nombre?.trim());
    await db.from("juego_colores").delete().eq("juego_id", juegoId);
    if (colores.length) {
      await db.from("juego_colores").insert(
        colores.map((c, i) => ({
          juego_id: juegoId,
          nombre: String(c.nombre).trim(),
          hex: c.hex || null,
          imagen_url: c.imagen_url || null,
          orden: i,
        }))
      );
    }

    // Composición: ollas individuales
    const comps = parseJsonArray(formData.get("componentes")).filter((c) => c?.producto_id);
    await db.from("juego_productos").delete().eq("juego_id", juegoId);
    if (comps.length) {
      await db.from("juego_productos").insert(
        comps.map((c, i) => ({
          juego_id: juegoId,
          producto_id: c.producto_id,
          cantidad: Math.max(1, parseInt(String(c.cantidad), 10) || 1),
          orden: i,
        }))
      );
    }
  }

  revalidatePath("/admin/juegos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/juegos");
}

export async function deleteJuego(formData: FormData) {
  await requireSession();
  const id = strOrNull(formData.get("id"));
  if (id) await supabaseAdmin().from("juegos").delete().eq("id", id);
  revalidatePath("/admin/juegos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin/juegos");
}
