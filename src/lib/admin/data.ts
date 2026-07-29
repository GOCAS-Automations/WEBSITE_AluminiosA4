import { supabaseAdmin } from "@/lib/supabase";
import type { Categoria, Usuario } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function adminCounts() {
  const db = supabaseAdmin();
  const [p, j, c, u] = await Promise.all([
    db.from("productos").select("*", { count: "exact", head: true }),
    db.from("juegos").select("*", { count: "exact", head: true }),
    db.from("categorias").select("*", { count: "exact", head: true }),
    db.from("usuarios").select("*", { count: "exact", head: true }),
  ]);
  return {
    productos: p.count ?? 0,
    juegos: j.count ?? 0,
    categorias: c.count ?? 0,
    usuarios: u.count ?? 0,
  };
}

/* -------- Productos -------- */
export async function getAllProductos() {
  const db = supabaseAdmin();
  const { data } = await db
    .from("productos")
    .select("*, categoria:categorias(nombre), colores:producto_colores(id)")
    .order("precio", { ascending: true });
  return data ?? [];
}

export async function getProductoAdmin(id: string) {
  const db = supabaseAdmin();
  const { data } = await db
    .from("productos")
    .select("*, colores:producto_colores(*)")
    .eq("id", id)
    .maybeSingle();
  if (data?.colores) {
    (data.colores as any[]).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  }
  return data;
}

export async function getProductosLite() {
  const db = supabaseAdmin();
  const { data } = await db
    .from("productos")
    .select("id, nombre, referencia, precio, categoria_id")
    .order("nombre", { ascending: true });
  return data ?? [];
}

/* -------- Juegos -------- */
export async function getAllJuegos() {
  const db = supabaseAdmin();
  const { data } = await db
    .from("juegos")
    .select("*, categoria:categorias(nombre), componentes:juego_productos(producto_id)")
    .order("precio", { ascending: true });
  return data ?? [];
}

export async function getJuegoAdmin(id: string) {
  const db = supabaseAdmin();
  const { data } = await db
    .from("juegos")
    .select(
      "*, colores:juego_colores(*), componentes:juego_productos(producto_id, cantidad, orden)"
    )
    .eq("id", id)
    .maybeSingle();
  if (data?.colores) (data.colores as any[]).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  if (data?.componentes) (data.componentes as any[]).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  return data;
}

/* -------- Categorías -------- */
export async function getAllCategorias(): Promise<Categoria[]> {
  const db = supabaseAdmin();
  const { data } = await db.from("categorias").select("*").order("orden");
  return (data as Categoria[]) ?? [];
}

export async function getCategoriaAdmin(id: string): Promise<Categoria | null> {
  const db = supabaseAdmin();
  const { data } = await db.from("categorias").select("*").eq("id", id).maybeSingle();
  return (data as Categoria) ?? null;
}

/* -------- Usuarios -------- */
export async function getAllUsuarios(): Promise<Usuario[]> {
  const db = supabaseAdmin();
  const { data } = await db
    .from("usuarios")
    .select("id, usuario, email, nombre, rol, activo, last_login, created_at, updated_at")
    .order("created_at");
  return (data as Usuario[]) ?? [];
}

export async function getUsuarioAdmin(id: string): Promise<Usuario | null> {
  const db = supabaseAdmin();
  const { data } = await db
    .from("usuarios")
    .select("id, usuario, email, nombre, rol, activo, last_login, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  return (data as Usuario) ?? null;
}
