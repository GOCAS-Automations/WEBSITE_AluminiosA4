import { notFound } from "next/navigation";
import CategoriaForm from "../CategoriaForm";
import { getCategoriaAdmin } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function EditarCategoria({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoria = await getCategoriaAdmin(id);
  if (!categoria) notFound();
  return <CategoriaForm categoria={categoria} />;
}
