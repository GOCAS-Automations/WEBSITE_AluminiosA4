import { notFound } from "next/navigation";
import PinForm from "../PinForm";
import { getPinAdmin } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function EditarPin({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const pin = await getPinAdmin(id);
  if (!pin) notFound();
  return <PinForm pin={pin} duplicado={sp?.error === "duplicado"} />;
}
