import JuegoForm from "../JuegoForm";
import { getAllCategorias, getProductosLite } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function NuevoJuego() {
  const [categorias, productos] = await Promise.all([getAllCategorias(), getProductosLite()]);
  return (
    <JuegoForm
      categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
      productos={(productos as any[]).map((p) => ({ id: p.id, nombre: p.nombre, referencia: p.referencia }))}
    />
  );
}
