"use client";

import { useState } from "react";
import { cn } from "@/lib/format";

/** Muestra una imagen de producto con fondo suave y placeholder si falla. */
export default function ImageBox({
  src,
  alt,
  className,
  imgClassName,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const [error, setError] = useState(false);
  const show = src && !error;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 to-white",
        className
      )}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src ?? undefined}
          alt={alt}
          onError={() => setError(true)}
          className={cn("h-full w-full object-contain p-4 transition-opacity duration-300", imgClassName)}
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-brand-300">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 9h16l-1 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 9Z" />
            <path d="M8 9V7a4 4 0 0 1 8 0v2" />
            <path d="M3 9h18" />
          </svg>
          <span className="text-xs font-medium text-slate-400">Imagen pendiente</span>
        </div>
      )}
    </div>
  );
}
