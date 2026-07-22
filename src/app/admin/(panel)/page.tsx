import Link from "next/link";
import { getSession } from "@/lib/auth";
import { adminCounts } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();
  const counts = await adminCounts();

  const cards = [
    { label: "Productos", value: counts.productos, href: "/admin/productos", color: "from-brand-400 to-brand-600" },
    { label: "Juegos de ollas", value: counts.juegos, href: "/admin/juegos", color: "from-coral-400 to-coral-600" },
    { label: "Categorías", value: counts.categorias, href: "/admin/categorias", color: "from-slate-500 to-slate-700" },
    ...(session?.rol === "administrador"
      ? [{ label: "Usuarios", value: counts.usuarios, href: "/admin/usuarios", color: "from-navy to-brand-700" }]
      : []),
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">
        Hola, {session?.nombre?.split(" ")[0]} 👋
      </h1>
      <p className="mt-1 text-slate-500">
        Este es el panel de administración del catálogo de Aluminios A4.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.color} p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}
          >
            <p className="text-4xl font-extrabold">{c.value}</p>
            <p className="mt-1 text-sm font-medium text-white/90">{c.label}</p>
            <span className="absolute right-4 top-4 text-white/50 transition group-hover:translate-x-0.5">→</span>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Acciones rápidas</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <QuickLink href="/admin/productos/nuevo" label="+ Nuevo producto" />
          <QuickLink href="/admin/juegos/nuevo" label="+ Nuevo juego" />
          <QuickLink href="/admin/categorias/nuevo" label="+ Nueva categoría" />
          {session?.rol === "administrador" && (
            <QuickLink href="/admin/usuarios/nuevo" label="+ Nuevo usuario" />
          )}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy transition hover:border-brand-300 hover:text-brand-700"
    >
      {label}
    </Link>
  );
}
