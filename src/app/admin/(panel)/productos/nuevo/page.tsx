import ProductoForm from "../ProductoForm";
import { getAllCategorias } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function NuevoProducto() {
  const categorias = await getAllCategorias();
  return <ProductoForm categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))} />;
}
