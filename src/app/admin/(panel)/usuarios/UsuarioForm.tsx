"use client";

import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { Section, Field, Input, Select, Toggle } from "@/components/admin/FormBits";
import { saveUsuario, deleteUsuario } from "./actions";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function UsuarioForm({
  usuario,
  currentUserId,
}: {
  usuario?: any;
  currentUserId: string;
}) {
  const isEdit = Boolean(usuario?.id);
  const isSelf = isEdit && usuario.id === currentUserId;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/usuarios" className="text-sm text-slate-400 hover:text-brand-700">
            ← Usuarios
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-navy">
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </h1>
        </div>
        {isEdit && !isSelf && (
          <form
            action={deleteUsuario}
            onSubmit={(e) => {
              if (!confirm("¿Eliminar este usuario?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={usuario.id} />
            <button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Eliminar
            </button>
          </form>
        )}
      </div>

      <form action={saveUsuario} className="space-y-5">
        <input type="hidden" name="id" defaultValue={usuario?.id ?? ""} />

        <Section title="Datos de acceso">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Usuario" hint="Se usa para iniciar sesión.">
              <Input name="usuario" required defaultValue={usuario?.usuario ?? ""} placeholder="jperez" autoComplete="off" />
            </Field>
            <Field label="Nombre completo">
              <Input name="nombre" required defaultValue={usuario?.nombre ?? ""} placeholder="Juan Pérez" />
            </Field>
          </div>
          <Field label="Correo (opcional)">
            <Input name="email" type="email" defaultValue={usuario?.email ?? ""} placeholder="correo@ejemplo.com" />
          </Field>
          <Field
            label={isEdit ? "Nueva contraseña" : "Contraseña"}
            hint={isEdit ? "Déjala en blanco para no cambiarla." : "Mínimo recomendado: 6 caracteres."}
          >
            <Input
              name="password"
              type="password"
              required={!isEdit}
              placeholder={isEdit ? "••••••••" : "Contraseña"}
              autoComplete="new-password"
            />
          </Field>
        </Section>

        <Section title="Rol y estado">
          <Field label="Rol" hint="El coordinador solo puede administrar el catálogo. El administrador tiene acceso total.">
            <Select name="rol" defaultValue={usuario?.rol ?? "coordinador"} disabled={isSelf}>
              <option value="coordinador">Coordinador</option>
              <option value="administrador">Administrador</option>
            </Select>
          </Field>
          {isSelf && (
            <input type="hidden" name="rol" value={usuario?.rol ?? "administrador"} />
          )}
          <Toggle name="activo" label="Cuenta activa" defaultChecked={usuario?.activo ?? true} />
          {isSelf && (
            <p className="text-xs text-slate-400">
              Es tu propia cuenta: no puedes cambiar tu rol ni eliminarte.
            </p>
          )}
        </Section>

        <div className="flex items-center gap-3">
          <SubmitButton>{isEdit ? "Guardar cambios" : "Crear usuario"}</SubmitButton>
          <Link href="/admin/usuarios" className="text-sm font-semibold text-slate-500 hover:text-navy">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
