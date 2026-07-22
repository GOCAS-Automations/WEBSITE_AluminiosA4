"use client";

import Link from "next/link";
import { useState } from "react";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import { Section, Field, Input, Textarea, Toggle } from "@/components/admin/FormBits";
import { saveCategoria, deleteCategoria } from "./actions";
import { slugify } from "@/lib/format";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CategoriaForm({ categoria }: { categoria?: any }) {
  const isEdit = Boolean(categoria?.id);
  const [nombre, setNombre] = useState(categoria?.nombre ?? "");
  const [slug, setSlug] = useState(categoria?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEdit);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/categorias" className="text-sm text-slate-400 hover:text-brand-700">
            ← Categorías
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-navy">
            {isEdit ? "Editar categoría" : "Nueva categoría"}
          </h1>
        </div>
        {isEdit && (
          <form
            action={deleteCategoria}
            onSubmit={(e) => {
              if (!confirm("¿Eliminar esta categoría? Los productos quedarán sin categoría.")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={categoria.id} />
            <button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Eliminar
            </button>
          </form>
        )}
      </div>

      <form action={saveCategoria} className="space-y-5">
        <input type="hidden" name="id" defaultValue={categoria?.id ?? ""} />

        <Section title="Datos">
          <Field label="Nombre">
            <Input
              name="nombre"
              required
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
              placeholder="Ollas"
            />
          </Field>
          <Field label="Slug (URL)" hint="Se usa en la dirección: /catalogo/[slug]">
            <Input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              placeholder="ollas"
            />
          </Field>
          <Field label="Descripción">
            <Textarea name="descripcion" defaultValue={categoria?.descripcion ?? ""} placeholder="Descripción de la categoría…" />
          </Field>
        </Section>

        <Section title="Imagen" desc="Opcional. Se muestra en la tarjeta de la categoría.">
          <ImageField name="imagen_url" label="Imagen de categoría" folder="categorias" defaultValue={categoria?.imagen_url ?? ""} />
        </Section>

        <Section title="Publicación">
          <Toggle name="activo" label="Visible en el catálogo" defaultChecked={categoria?.activo ?? true} />
          <Field label="Orden" hint="Menor número aparece primero.">
            <Input name="orden" type="number" step="1" defaultValue={categoria?.orden ?? 0} className="max-w-[140px]" />
          </Field>
        </Section>

        <div className="flex items-center gap-3">
          <SubmitButton>{isEdit ? "Guardar cambios" : "Crear categoría"}</SubmitButton>
          <Link href="/admin/categorias" className="text-sm font-semibold text-slate-500 hover:text-navy">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
