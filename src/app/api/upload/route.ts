import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin, BUCKET, publicUrl } from "@/lib/supabase";
import { slugify } from "@/lib/format";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "productos").replace(/[^a-z0-9/_-]/gi, "");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen supera 10 MB" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "img";
  const path = `${folder || "productos"}/${Date.now()}-${base}.${ext || "png"}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  let db;
  try {
    db = supabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor" },
      { status: 500 }
    );
  }

  const { error } = await db.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "image/png",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: publicUrl(path), path });
}
