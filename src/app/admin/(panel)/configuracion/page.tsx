import { requireSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { DEFAULT_CONFIG, type SiteConfig } from "@/lib/config";
import ConfiguracionForm from "./ConfiguracionForm";

export const dynamic = "force-dynamic";

/** Lee la fila única con service role (bypassa RLS) y completa con los defaults. */
async function getConfiguracionAdmin(): Promise<SiteConfig> {
  try {
    const { data } = await supabaseAdmin()
      .from("configuracion")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (!data) return { ...DEFAULT_CONFIG };
    const row = data as Record<string, unknown>;
    const out = { ...DEFAULT_CONFIG };
    for (const k of Object.keys(DEFAULT_CONFIG) as (keyof SiteConfig)[]) {
      const v = row[k];
      if (typeof DEFAULT_CONFIG[k] === "boolean") {
        if (typeof v === "boolean") (out[k] as boolean) = v;
      } else if (typeof v === "string" && v.trim() !== "") {
        (out[k] as string) = v;
      }
    }
    return out;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireSession();
  const [cfg, sp] = await Promise.all([getConfiguracionAdmin(), searchParams]);

  return <ConfiguracionForm cfg={cfg} guardado={sp?.ok === "1"} />;
}
