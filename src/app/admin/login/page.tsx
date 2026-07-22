"use client";

import { useActionState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { login, type LoginState } from "../actions";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <div className="flex min-h-screen items-center justify-center a4-waves px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-white/95 px-5 py-4 shadow-lg">
            <Logo />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-xl">
          <h1 className="text-xl font-extrabold text-navy">Acceso empleados</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa con tu usuario para administrar el catálogo.
          </p>

          <form action={action} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Usuario</label>
              <input
                name="usuario"
                autoComplete="username"
                autoFocus
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy">Contraseña</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="••••••••"
              />
            </div>

            {state.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
          >
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
