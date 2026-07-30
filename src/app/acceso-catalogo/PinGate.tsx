"use client";

import Link from "next/link";
import { useState } from "react";

export default function PinGate({ next, waHref }: { next: string; waHref: string }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/catalogo/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, next }),
      });
      if (res.ok) {
        window.location.replace(next || "/catalogo");
        return; // no soltamos el estado "Verificando…": la página se está reemplazando
      }
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No pudimos validar el PIN. Intenta de nuevo.");
    } catch {
      setError("No pudimos conectar. Revisa tu conexión e intenta de nuevo.");
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <input
        name="pin"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        inputMode="text"
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={64}
        placeholder="PIN"
        aria-label="PIN de acceso"
        className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-center text-lg font-bold uppercase tracking-[0.3em] outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || pin.trim() === ""}
        className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Verificando…" : "Entrar al catálogo"}
      </button>

      <div className="flex items-center justify-between gap-3 pt-1">
        <Link href="/" className="text-xs font-semibold text-slate-400 transition hover:text-navy">
          ← Volver al inicio
        </Link>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5 0-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1-1.4-1-2.6 0-1.3.6-1.9.9-2.1.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.3.7 1.2 1.5 1.9 1 .9 1.8 1.2 2.1 1.3.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.5-.1l2 1c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z" />
          </svg>
          Solicitar un PIN
        </a>
      </div>
    </form>
  );
}
