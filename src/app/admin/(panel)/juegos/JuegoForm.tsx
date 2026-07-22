"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import ColoresEditor, { type ColorRow } from "@/components/admin/ColoresEditor";
import ComponentesEditor from "@/components/admin/ComponentesEditor";
import SubmitButton from "@/components/admin/SubmitButton";
import { Section, Field, Input, Textarea, Select, Toggle } from "@/components/admin/FormBits";
import { saveJuego, deleteJuego } from "./actions";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Cat = { id: string; nombre: string };
type ProdLite = { id: string; nombre: string; referencia: string | null };

export default function JuegoForm({
  juego,
  categorias,
  productos,
}: {
  juego?: any;
  categorias: Cat[];
  productos: ProdLite[];
}) {
  const isEdit = Boolean(juego?.id);
  const colores: ColorRow[] = (juego?.colores ?? []).map((c: any) => ({
    nombre: c.nombre ?? "",
    hex: c.hex ?? "#e23b33",
    imagen_url: c.imagen_url ?? "",
  }));
  const componentes = (juego?.componentes ?? []).map((c: any) => ({
    producto_id: c.producto_id,
    cantidad: c.cantidad ?? 1,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/juegos" className="text-sm text-slate-400 hover:text-brand-700">
            ← Juegos
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-navy">
            {isEdit ? "Editar juego" : "Nuevo juego de ollas"}
          </h1>
        </div>
        {isEdit && (
          <form
            action={deleteJuego}
            onSubmit={(e) => {
              if (!confirm("¿Eliminar este juego? Las ollas individuales NO se eliminan.")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={juego.id} />
            <button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Eliminar
            </button>
          </form>
        )}
      </div>

      <form action={saveJuego} className="space-y-5">
        <input type="hidden" name="id" defaultValue={juego?.id ?? ""} />

        <Section title="Datos básicos">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre">
              <Input name="nombre" required defaultValue={juego?.nombre ?? ""} placeholder="Juego Olla Manija 14-22" />
            </Field>
            <Field label="Referencia (SKU)">
              <Input name="referencia" defaultValue={juego?.referencia ?? ""} placeholder="JOM-1422" />
            </Field>
          </div>
          <Field label="Categoría">
            <Select name="categoria_id" defaultValue={juego?.categoria_id ?? ""}>
              <option value="">— Sin categoría —</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </Select>
          </Field>
          <Field label="Descripción">
            <Textarea name="descripcion" defaultValue={juego?.descripcion ?? ""} placeholder="Descripción del juego…" />
          </Field>
        </Section>

        <Section title="Ollas del juego" desc="Selecciona las ollas individuales que componen este juego.">
          <ComponentesEditor name="componentes" productos={productos} defaultValue={componentes} />
        </Section>

        <Section title="Precio y empaque">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Precio del juego (COP)">
              <Input name="precio" type="number" step="1" min="0" required defaultValue={juego?.precio ?? ""} placeholder="95500" />
            </Field>
            <Field label="Empaque (nota de caja)" hint="Ej: 1 x Caja">
              <Input name="empaque" defaultValue={juego?.empaque ?? ""} placeholder="1 x Caja" />
            </Field>
          </div>
          <Toggle name="refuerzo" label="Con refuerzo" defaultChecked={juego?.refuerzo ?? false} />
        </Section>

        <Section title="Imágenes" desc="El juego tiene su propia foto y su propio código QR.">
          <ImageField name="imagen_url" label="Foto del juego" folder="juegos" defaultValue={juego?.imagen_url ?? ""} />
          <ImageField name="qr_url" label="Código QR" folder="qr" defaultValue={juego?.qr_url ?? ""} />
        </Section>

        <Section title="Colores de tapa" desc="Opcional. Cada color puede tener su propia foto del juego.">
          <ColoresEditor name="colores" defaultValue={colores} folder="juegos" />
        </Section>

        <Section title="Publicación">
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle name="activo" label="Visible en el catálogo" defaultChecked={juego?.activo ?? true} />
            <Toggle name="destacado" label="Destacado en el inicio" defaultChecked={juego?.destacado ?? false} />
          </div>
          <Field label="Orden" hint="Menor número aparece primero.">
            <Input name="orden" type="number" step="1" defaultValue={juego?.orden ?? 0} className="max-w-[140px]" />
          </Field>
        </Section>

        <div className="flex items-center gap-3">
          <SubmitButton>{isEdit ? "Guardar cambios" : "Crear juego"}</SubmitButton>
          <Link href="/admin/juegos" className="text-sm font-semibold text-slate-500 hover:text-navy">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
