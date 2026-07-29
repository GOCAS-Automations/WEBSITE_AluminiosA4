"use client";

/** Normaliza texto para búsquedas case-insensitive y sin acentos. */
export function normalizarTexto(s: string): string {
  // Descompone en NFD (letra + marca diacrítica) y descarta las marcas
  // combinables (rango Unicode 0x0300–0x036F) para comparar sin acentos.
  const sinAcentos = Array.from((s ?? "").normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 768 || code > 879;
    })
    .join("");
  return sinAcentos.toLowerCase().trim();
}

interface FiltrosBarProps {
  busqueda: string;
  onBusquedaChange: (v: string) => void;
  categoria: string;
  onCategoriaChange: (v: string) => void;
  categorias: string[];
  estado: string;
  onEstadoChange: (v: string) => void;
  mostrando: number;
  total: number;
  onLimpiar: () => void;
  placeholderBusqueda?: string;
}

export default function FiltrosBar({
  busqueda,
  onBusquedaChange,
  categoria,
  onCategoriaChange,
  categorias,
  estado,
  onEstadoChange,
  mostrando,
  total,
  onLimpiar,
  placeholderBusqueda,
}: FiltrosBarProps) {
  const hayFiltros = busqueda !== "" || categoria !== "" || estado !== "";

  return (
    <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Buscar</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder={placeholderBusqueda ?? "Nombre o referencia..."}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => onCategoriaChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Estado</label>
          <select
            value={estado}
            onChange={(e) => onEstadoChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">Todos</option>
            <option value="visibles">Visibles</option>
            <option value="ocultos">Ocultos</option>
          </select>
        </div>
        <div className="flex items-center gap-3 pb-2 text-sm text-slate-500">
          <span>
            Mostrando {mostrando} de {total}
          </span>
          {hayFiltros && (
            <button
              type="button"
              onClick={onLimpiar}
              className="font-semibold text-brand-700 hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
