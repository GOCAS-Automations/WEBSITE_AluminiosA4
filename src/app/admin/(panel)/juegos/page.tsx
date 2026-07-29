import Link from "next/link";
import { getAllJuegos } from "@/lib/admin/data";
import TablaJuegos from "@/components/admin/TablaJuegos";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function JuegosListPage() {
  const juegos = (await getAllJuegos()) as any[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Juegos de ollas</h1>
          <p className="text-sm text-slate-500">{juegos.length} juegos</p>
        </div>
        <Link
          href="/admin/juegos/nuevo"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          + Nuevo juego
        </Link>
      </div>

      <TablaJuegos juegos={juegos} />
    </div>
  );
}
