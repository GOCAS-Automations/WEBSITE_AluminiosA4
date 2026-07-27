"use client";

import { useState } from "react";
import { cn } from "@/lib/format";
import { Logo } from "@/components/Logo";

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
        <div className="flex flex-col items-center justify-center gap-2 p-4">
          <Logo showText={false} size={56} className="opacity-35 saturate-50" />
          <span className="text-xs font-medium text-slate-400">Imagen próximamente</span>
        </div>
      )}
    </div>
  );
}
