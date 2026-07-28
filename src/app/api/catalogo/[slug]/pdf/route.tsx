import fs from "node:fs";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import CatalogoPDF, { type PDFImagen } from "@/lib/pdf/CatalogoPDF";
import {
  getCategoriaBySlug,
  getProductosByCategoria,
  getJuegosByCategoria,
} from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Detecta el formato soportado por @react-pdf a partir de los magic bytes. */
function detectarFormato(buf: Buffer): "png" | "jpg" | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  return null;
}

/**
 * Descarga los QR antes de renderizar: así una URL caída o lenta no rompe
 * el PDF completo (la celda muestra "QR pendiente").
 */
async function descargarQRs(urls: string[]): Promise<Record<string, PDFImagen | null>> {
  const unicos = Array.from(new Set(urls.filter(Boolean)));
  const entradas = await Promise.all(
    unicos.map(async (url): Promise<[string, PDFImagen | null]> => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
        if (!res.ok) return [url, null];
        const buf = Buffer.from(await res.arrayBuffer());
        const format = detectarFormato(buf);
        return format ? [url, { data: buf, format }] : [url, null];
      } catch {
        return [url, null];
      }
    })
  );
  return Object.fromEntries(entradas);
}

function leerLogo(): Buffer | null {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public", "logo-a4-pdf.png"));
  } catch {
    try {
      return fs.readFileSync(path.join(process.cwd(), "public", "logo-a4.png"));
    } catch {
      return null;
    }
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const categoria = await getCategoriaBySlug(slug);
  if (!categoria) {
    return Response.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  const [productos, juegos] = await Promise.all([
    getProductosByCategoria(categoria.id),
    getJuegosByCategoria(categoria.id),
  ]);

  const qrImages = await descargarQRs([
    ...productos.map((p) => p.qr_url ?? ""),
    ...juegos.map((j) => j.qr_url ?? ""),
  ]);

  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const buffer = await renderToBuffer(
    <CatalogoPDF
      categoria={{ nombre: categoria.nombre, descripcion: categoria.descripcion }}
      productos={productos}
      juegos={juegos}
      fecha={fecha}
      logo={leerLogo()}
      qrImages={qrImages}
    />
  );

  // El slug va dentro de una cabecera: se limpia por precaución.
  const nombreArchivo = `catalogo-${slug.replace(/[^a-zA-Z0-9-]/g, "-")}-aluminios-a4.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
