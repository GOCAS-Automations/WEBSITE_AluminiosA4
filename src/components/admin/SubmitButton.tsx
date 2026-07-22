"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/format";

export default function SubmitButton({
  children,
  className,
  pendingText = "Guardando…",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60",
        className
      )}
    >
      {pending ? pendingText : children}
    </button>
  );
}
