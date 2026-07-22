import { requireSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <AdminShell session={session}>{children}</AdminShell>;
}
