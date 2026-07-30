"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";
import { strOrNull, boolFrom } from "@/lib/admin/form";

/** Vuelve al formulario conservando el aviso de PIN duplicado. */
function volverConError(id: string | null) {
  redirect(`/admin/pines/${id ?? "nuevo"}?error=duplicado`);
}

export async function savePin(formData: FormData) {
  await requireSession();
  const db = supabaseAdmin();
  const id = strOrNull(formData.get("id"));

  const pin = String(formData.get("pin") ?? "").trim();
  if (pin.length < 4 || pin.length > 32) return;

  // Unicidad case-insensitive, igual que al canjearlo. Sin `.ilike()`: `%` y `_`
  // son comodines de SQL LIKE y darían falsos positivos con PINes que los usen.
  const { data: existentes } = await db.from("catalogo_pines").select("id, pin");
  const buscado = pin.toLowerCase();
  const choque = (existentes ?? []).find(
    (r) => String(r.pin ?? "").trim().toLowerCase() === buscado
  );
  if (choque && choque.id !== id) volverConError(id);

  // Un date input da "YYYY-MM-DD": se toma el final del día para que el PIN
  // siga sirviendo durante toda la fecha elegida.
  const expiraRaw = strOrNull(formData.get("expira_at"));
  const expira_at = expiraRaw ? new Date(`${expiraRaw}T23:59:59`).toISOString() : null;

  const payload = {
    pin,
    etiqueta: strOrNull(formData.get("etiqueta")),
    notas: strOrNull(formData.get("notas")),
    activo: boolFrom(formData.get("activo")),
    expira_at,
  };

  if (id) await db.from("catalogo_pines").update(payload).eq("id", id);
  else await db.from("catalogo_pines").insert(payload);

  revalidatePath("/admin/pines");
  redirect("/admin/pines");
}

export async function deletePin(formData: FormData) {
  await requireSession();
  const id = strOrNull(formData.get("id"));
  if (id) await supabaseAdmin().from("catalogo_pines").delete().eq("id", id);
  revalidatePath("/admin/pines");
  redirect("/admin/pines");
}
