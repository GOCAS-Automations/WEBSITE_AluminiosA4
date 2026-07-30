import PinForm from "../PinForm";

export const dynamic = "force-dynamic";

export default async function NuevoPin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return <PinForm duplicado={sp?.error === "duplicado"} />;
}
