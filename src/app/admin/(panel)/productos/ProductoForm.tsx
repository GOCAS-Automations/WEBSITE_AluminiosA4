"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import ColoresEditor, { type ColorRow } from "@/components/admin/ColoresEditor";
import SubmitButton from "@/components/admin/SubmitButton";
import { Section, Field, Input, Textarea, Select, Toggle } from "@/components/admin/FormBits";
import { saveProducto, deleteProducto } from "./actions";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Cat = { id: string; nombre: string };

export default function ProductoForm({
  producto,
  categorias,
}: {
  producto?: any;
  categorias: Cat[];
}) {
  const isEdit = Boolean(producto?.id);
  const colores: ColorRow[] = (producto?.colores ?? []).map((c: any) => ({
    nombre: c.nombre ?? "",
    hex: c.hex ?? "#e23b33",
    imagen_url: c.imagen_url ?? "",
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/productos" className="text-sm text-slate-400 hover:text-brand-700">
            ← Productos
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-navy">
            {isEdit ? "Editar producto" : "Nuevo producto"}
          </h1>
        </div>
        {isEdit && (
          <form
            action={deleteProducto}
            onSubmit={(e) => {
              if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={producto.id} />
            <button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Eliminar
            </button>
          </form>
        )}
      </div>

      <form action={saveProducto} className="space-y-5">
        <input type="hidden" name="id" defaultValue={producto?.id ?? ""} />

        <Section title="Datos básicos">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre">
              <Input name="nombre" required defaultValue={producto?.nombre ?? ""} placeholder="Olla Manija #14" />
            </Field>
            <Field label="Referencia (SKU)">
              <Input name="referencia" defaultValue={producto?.referencia ?? ""} placeholder="OM-14" />
            </Field>
          </div>
          <Field label="Categoría">
            <Select name="categoria_id" defaultValue={producto?.categoria_id ?? ""}>
              <option value="">— Sin categoría —</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </Select>
          </Field>
          <Field label="Descripción">
            <Textarea name="descripcion" defaultValue={producto?.descripcion ?? ""} placeholder="Breve descripción del producto…" />
          </Field>
        </Section>

        <Section title="Medidas">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Diámetro (cm)">
              <Input name="diametro_cm" inputMode="decimal" defaultValue={producto?.diametro_cm ?? ""} placeholder="14" />
            </Field>
            <Field label="Altura (cm)">
              <Input name="altura_cm" inputMode="decimal" defaultValue={producto?.altura_cm ?? ""} placeholder="9" />
            </Field>
            <Field label="Capacidad">
              <Input name="capacidad" defaultValue={producto?.capacidad ?? ""} placeholder="1,4 L" />
            </Field>
          </div>
        </Section>

        <Section title="Precio y empaque">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Precio (COP)">
              <Input name="precio" type="number" step="1" min="0" required defaultValue={producto?.precio ?? ""} placeholder="16500" />
            </Field>
            <Field label="Empaque (nota de caja)" hint="Ej: Caja x 12, Caja 20…">
              <Input name="empaque" defaultValue={producto?.empaque ?? ""} placeholder="Caja x 12" />
            </Field>
          </div>
          <Toggle name="refuerzo" label="Con refuerzo" defaultChecked={producto?.refuerzo ?? false} />
        </Section>

        <Section title="Imágenes" desc="Sube una imagen (se guarda en Supabase) o pega una URL (Cloudinary, etc.).">
          <ImageField name="imagen_url" label="Foto principal" folder="productos" defaultValue={producto?.imagen_url ?? ""} />
          <ImageField name="qr_url" label="Código QR" folder="qr" defaultValue={producto?.qr_url ?? ""} />
        </Section>

        <Section title="Colores de tapa" desc="Cada color puede tener su propia foto (se muestra al elegirlo en el catálogo).">
          <ColoresEditor name="colores" defaultValue={colores} folder="productos" />
        </Section>

        <Section title="Publicación">
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle name="activo" label="Visible en el catálogo" defaultChecked={producto?.activo ?? true} />
            <Toggle name="destacado" label="Destacado en el inicio" defaultChecked={producto?.destacado ?? false} />
          </div>
          <Field label="Orden" hint="Menor número aparece primero.">
            <Input name="orden" type="number" step="1" defaultValue={producto?.orden ?? 0} className="max-w-[140px]" />
          </Field>
        </Section>

        <div className="flex items-center gap-3">
          <SubmitButton>{isEdit ? "Guardar cambios" : "Crear producto"}</SubmitButton>
          <Link href="/admin/productos" className="text-sm font-semibold text-slate-500 hover:text-navy">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
