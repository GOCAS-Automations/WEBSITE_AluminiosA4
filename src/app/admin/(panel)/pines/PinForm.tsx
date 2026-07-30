"use client";

import Link from "next/link";
import { useState } from "react";
import SubmitButton from "@/components/admin/SubmitButton";
import { Section, Field, Input, Textarea, Toggle } from "@/components/admin/FormBits";
import { savePin, deletePin } from "./actions";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Sin caracteres ambiguos (0/O, 1/I/L) para dictarlo por teléfono sin errores. */
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generarPin(): string {
  let s = "";
  const buf = new Uint32Array(4);
  crypto.getRandomValues(buf);
  for (const n of buf) s += ALFABETO[n % ALFABETO.length];
  return `AA4-${s}`;
}

/** `timestamptz` → `YYYY-MM-DD` en hora local, para el input type="date". */
function aFechaInput(v: string | null | undefined): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function PinForm({ pin, duplicado }: { pin?: any; duplicado?: boolean }) {
  const isEdit = Boolean(pin?.id);
  const [valor, setValor] = useState(pin?.pin ?? "");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/pines" className="text-sm text-slate-400 hover:text-brand-700">
            ← Pines de catálogo
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-navy">
            {isEdit ? "Editar PIN" : "Nuevo PIN"}
          </h1>
        </div>
        {isEdit && (
          <form
            action={deletePin}
            onSubmit={(e) => {
              if (!confirm("¿Eliminar este PIN? Quien lo tenga perderá el acceso al catálogo."))
                e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={pin.id} />
            <button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Eliminar
            </button>
          </form>
        )}
      </div>

      {duplicado && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          Ese PIN ya existe. Elige otro o usa el botón «Generar».
        </p>
      )}

      <form action={savePin} className="space-y-5">
        <input type="hidden" name="id" defaultValue={pin?.id ?? ""} />

        <Section
          title="PIN"
          desc="Es la clave que compartes con el cliente para que vea el catálogo con precios."
        >
          <Field label="PIN" hint="Entre 4 y 32 caracteres. No distingue mayúsculas de minúsculas.">
            <div className="flex gap-2">
              <Input
                name="pin"
                required
                minLength={4}
                maxLength={32}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="AA4-2026"
                className="font-mono font-bold tracking-wider"
              />
              <button
                type="button"
                onClick={() => setValor(generarPin())}
                className="shrink-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                Generar
              </button>
            </div>
          </Field>
          <Field label="Etiqueta" hint="¿Para quién es este PIN?">
            <Input
              name="etiqueta"
              defaultValue={pin?.etiqueta ?? ""}
              placeholder="Distribuidor Cali norte"
            />
          </Field>
          <Field label="Notas">
            <Textarea
              name="notas"
              defaultValue={pin?.notas ?? ""}
              placeholder="Detalles internos sobre este PIN…"
            />
          </Field>
        </Section>

        <Section title="Vigencia">
          <Toggle
            name="activo"
            label="PIN activo"
            hint="Desactívalo para revocar el acceso sin borrar el registro."
            defaultChecked={pin?.activo ?? true}
          />
          <Field label="Expira el" hint="Déjalo vacío para que no expire.">
            <Input
              name="expira_at"
              type="date"
              defaultValue={aFechaInput(pin?.expira_at)}
              className="max-w-[200px]"
            />
          </Field>
        </Section>

        <div className="flex items-center gap-3">
          <SubmitButton>{isEdit ? "Guardar cambios" : "Crear PIN"}</SubmitButton>
          <Link href="/admin/pines" className="text-sm font-semibold text-slate-500 hover:text-navy">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
