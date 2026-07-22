import { notFound } from "next/navigation";
import ProductoForm from "../ProductoForm";
import { getProductoAdmin, getAllCategorias } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function EditarProducto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, categorias] = await Promise.all([getProductoAdmin(id), getAllCategorias()]);
  if (!producto) notFound();
  return (
    <ProductoForm producto={producto} categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))} />
  );
}
