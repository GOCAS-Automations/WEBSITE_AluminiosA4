import { requireAdmin } from "@/lib/auth";
import UsuarioForm from "../UsuarioForm";

export const dynamic = "force-dynamic";

export default async function NuevoUsuario() {
  const session = await requireAdmin();
  return <UsuarioForm currentUserId={session.uid} />;
}
