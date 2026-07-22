import { supabasePublic } from "./supabase";
import type {
  Categoria,
  CategoriaConConteo,
  ProductoConColores,
  JuegoConDetalle,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function num(v: any): number {
  return typeof v === "string" ? parseFloat(v) : v ?? 0;
}
function maybeNum(v: any): number | null {
  return v === null || v === undefined ? null : num(v);
}

function normProducto(row: any): ProductoConColores {
  const colores = (row.colores ?? [])
    .slice()
    .sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0));
  return {
    ...row,
    precio: num(row.precio),
    diametro_cm: maybeNum(row.diametro_cm),
    altura_cm: maybeNum(row.altura_cm),
    colores,
  };
}

function normJuego(row: any): JuegoConDetalle {
  const colores = (row.colores ?? [])
    .slice()
    .sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0));
  const componentes = (row.componentes ?? [])
    .map((c: any) => ({
      producto: c.producto ? { ...c.producto, precio: num(c.producto.precio) } : null,
      cantidad: c.cantidad ?? 1,
      orden: c.orden ?? 0,
    }))
    .filter((c: any) => c.producto)
    .sort((a: any, b: any) => a.orden - b.orden);
  return { ...row, precio: num(row.precio), colores, componentes };
}

const PROD_SELECT = "*, colores:producto_colores(*)";
const JUEGO_SELECT =
  "*, colores:juego_colores(*), componentes:juego_productos(cantidad, orden, producto:productos(*))";

/* ---------- Categorías ---------- */

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await supabasePublic
    .from("categorias")
    .select("*")
    .eq("activo", true)
    .order("orden");
  return (data as Categoria[]) ?? [];
}

export async function getCategoriasConConteo(): Promise<CategoriaConConteo[]> {
  const cats = await getCategorias();
  const [{ data: prods }, { data: juegos }] = await Promise.all([
    supabasePublic.from("productos").select("categoria_id").eq("activo", true),
    supabasePublic.from("juegos").select("categoria_id").eq("activo", true),
  ]);
  const countP = new Map<string, number>();
  const countJ = new Map<string, number>();
  (prods ?? []).forEach((p: any) => countP.set(p.categoria_id, (countP.get(p.categoria_id) ?? 0) + 1));
  (juegos ?? []).forEach((j: any) => countJ.set(j.categoria_id, (countJ.get(j.categoria_id) ?? 0) + 1));
  return cats.map((c) => ({
    ...c,
    total_productos: countP.get(c.id) ?? 0,
    total_juegos: countJ.get(c.id) ?? 0,
  }));
}

export async function getCategoriaBySlug(slug: string): Promise<Categoria | null> {
  const { data } = await supabasePublic
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  return (data as Categoria) ?? null;
}

/* ---------- Productos ---------- */

export async function getProductosByCategoria(
  categoriaId: string
): Promise<ProductoConColores[]> {
  const { data } = await supabasePublic
    .from("productos")
    .select(PROD_SELECT)
    .eq("categoria_id", categoriaId)
    .eq("activo", true)
    .order("orden");
  return (data ?? []).map(normProducto);
}

export async function getProductoById(id: string): Promise<ProductoConColores | null> {
  const { data } = await supabasePublic
    .from("productos")
    .select(PROD_SELECT + ", categoria:categorias(*)")
    .eq("id", id)
    .maybeSingle();
  return data ? normProducto(data) : null;
}

export async function getDestacadosProductos(limit = 4): Promise<ProductoConColores[]> {
  const { data } = await supabasePublic
    .from("productos")
    .select(PROD_SELECT)
    .eq("activo", true)
    .eq("destacado", true)
    .order("orden")
    .limit(limit);
  return (data ?? []).map(normProducto);
}

/* ---------- Juegos ---------- */

export async function getJuegosByCategoria(categoriaId: string): Promise<JuegoConDetalle[]> {
  const { data } = await supabasePublic
    .from("juegos")
    .select(JUEGO_SELECT)
    .eq("categoria_id", categoriaId)
    .eq("activo", true)
    .order("orden");
  return (data ?? []).map(normJuego);
}

export async function getJuegoById(id: string): Promise<JuegoConDetalle | null> {
  const { data } = await supabasePublic
    .from("juegos")
    .select(JUEGO_SELECT + ", categoria:categorias(*)")
    .eq("id", id)
    .maybeSingle();
  return data ? normJuego(data) : null;
}

export async function getDestacadosJuegos(limit = 3): Promise<JuegoConDetalle[]> {
  const { data } = await supabasePublic
    .from("juegos")
    .select(JUEGO_SELECT)
    .eq("activo", true)
    .eq("destacado", true)
    .order("orden")
    .limit(limit);
  return (data ?? []).map(normJuego);
}
