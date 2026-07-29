import Link from "next/link";
import { getAllProductos } from "@/lib/admin/data";
import TablaProductos from "@/components/admin/TablaProductos";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function ProductosListPage() {
  const productos = (await getAllProductos()) as any[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Productos</h1>
          <p className="text-sm text-slate-500">{productos.length} ollas individuales</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          + Nuevo producto
        </Link>
      </div>

      <TablaProductos productos={productos} />
    </div>
  );
}
