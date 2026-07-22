import { notFound } from "next/navigation";
import JuegoForm from "../JuegoForm";
import { getJuegoAdmin, getAllCategorias, getProductosLite } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function EditarJuego({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [juego, categorias, productos] = await Promise.all([
    getJuegoAdmin(id),
    getAllCategorias(),
    getProductosLite(),
  ]);
  if (!juego) notFound();
  return (
    <JuegoForm
      juego={juego}
      categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
      productos={(productos as any[]).map((p) => ({ id: p.id, nombre: p.nombre, referencia: p.referencia }))}
    />
  );
}
