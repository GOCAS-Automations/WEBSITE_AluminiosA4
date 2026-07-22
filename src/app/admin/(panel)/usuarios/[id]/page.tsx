import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import UsuarioForm from "../UsuarioForm";
import { getUsuarioAdmin } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function EditarUsuario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const usuario = await getUsuarioAdmin(id);
  if (!usuario) notFound();
  return <UsuarioForm usuario={usuario} currentUserId={session.uid} />;
}
