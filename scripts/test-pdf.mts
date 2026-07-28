/**
 * Smoke test del PDF de catálogo — NO toca la base de datos.
 *
 * Uso:  npx tsx scripts/test-pdf.mts
 *
 * Renderiza el componente CatalogoPDF con datos mock (5 productos + 2 juegos)
 * y escribe los PDF resultantes en la carpeta de scratchpad de la sesión.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import * as CatalogoPDFMod from "../src/lib/pdf/CatalogoPDF";
import type { PDFImagen, PDFProducto, PDFJuego } from "../src/lib/pdf/CatalogoPDF";

/**
 * tsx compila el .tsx como CJS (package.json sin "type": "module"), así que el
 * default llega envuelto en { default }. Next no tiene este problema; esto solo
 * afecta a este script.
 */
type CatalogoPDFType = typeof CatalogoPDFMod.default;
const _mod = CatalogoPDFMod.default as unknown;
const CatalogoPDF = (
  typeof _mod === "function" ? _mod : (_mod as { default: CatalogoPDFType }).default
) as CatalogoPDFType;

const OUT_DIR =
  "C:\\Users\\cesar\\AppData\\Local\\Temp\\claude\\c--Users-cesar-OneDrive-Escritorio-FREELANCE-Aluminios-A4\\32ec8822-79c9-4e63-abd4-e825ba491f46\\scratchpad";

const QR_CANDIDATOS = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png",
  "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=A4-171",
];

/* ---------------- datos mock ---------------- */

function productos(qr: string | null): PDFProducto[] {
  return [
    {
      id: "p1",
      nombre: "Olla Sopera N° 30 con tapa",
      referencia: "A4-171",
      diametro_cm: 30,
      altura_cm: 16.5,
      capacidad: "11 L",
      colores_manija: "Negro, Rojo, Azul",
      refuerzo: true,
      empaque: "Caja x 6 unidades",
      precio: 128900,
      precio_empaque: 749900,
      qr_url: qr,
      colores: [
        { nombre: "Natural", hex: "#D7DDE2" },
        { nombre: "Negro", hex: "#22323C" },
        { nombre: "Coral", hex: "#EF7748" },
      ],
    },
    {
      id: "p2",
      nombre: "Olla Arrocera N° 24",
      referencia: "A4-152",
      diametro_cm: 24,
      altura_cm: 12,
      capacidad: "6 L",
      colores_manija: "Negro",
      refuerzo: false,
      empaque: "Caja x 12 unidades",
      precio: 86500,
      precio_empaque: 986500,
      qr_url: qr,
      colores: [
        { nombre: "Natural", hex: "#D7DDE2" },
        { nombre: "Turquesa", hex: "#32CCD8" },
      ],
    },
    {
      id: "p3",
      nombre: "Olla Honda N° 20 sin tapa",
      referencia: "A4-118",
      diametro_cm: 20,
      altura_cm: 10,
      capacidad: null,
      colores_manija: null,
      refuerzo: false,
      empaque: "Bolsa x 1",
      precio: 54000,
      precio_empaque: null,
      qr_url: null,
      colores: [],
    },
    {
      id: "p4",
      nombre: "Caldero Fundido N° 28 con manija reforzada y tapa alta",
      referencia: "A4-203",
      diametro_cm: 28,
      altura_cm: null,
      capacidad: "9,5 L",
      colores_manija: "Negro, Verde, Vinotinto, Azul rey",
      refuerzo: true,
      empaque: "Caja x 4 unidades",
      precio: 214300,
      precio_empaque: 214300,
      qr_url: null,
      colores: [
        { nombre: "Natural", hex: "#D7DDE2" },
        { nombre: "Negro", hex: "#22323C" },
        { nombre: "Vinotinto", hex: "#7B1E3A" },
        { nombre: "Verde", hex: "#2F7D57" },
        { nombre: "Azul", hex: "#1B4F8A" },
      ],
    },
    {
      id: "p5",
      nombre: "Paila Cónica N° 34",
      referencia: null,
      diametro_cm: 34,
      altura_cm: 9,
      capacidad: "7 L",
      colores_manija: "Negro",
      refuerzo: false,
      empaque: null,
      precio: 97400,
      qr_url: null,
      colores: [{ nombre: "Sin color de tapa", hex: null }],
    },
  ];
}

function juegos(qr: string | null): PDFJuego[] {
  return [
    {
      id: "j1",
      nombre: "Juego de Ollas Familiar x 5 piezas",
      referencia: "A4-J01",
      refuerzo: true,
      empaque: "Caja x 1 juego",
      precio: 489000,
      precio_empaque: null,
      qr_url: qr,
      colores: [
        { nombre: "Natural", hex: "#D7DDE2" },
        { nombre: "Negro", hex: "#22323C" },
      ],
      componentes: [
        { producto: { nombre: "Olla Sopera N° 30" }, cantidad: 1 },
        { producto: { nombre: "Olla Arrocera N° 24" }, cantidad: 2 },
        { producto: { nombre: "Olla Honda N° 20" }, cantidad: 1 },
        { producto: { nombre: "Caldero N° 28" }, cantidad: 1 },
      ],
    },
    {
      id: "j2",
      nombre: "Juego Básico x 3 piezas",
      referencia: "A4-J02",
      refuerzo: false,
      empaque: "Caja x 2 juegos",
      precio: 268500,
      precio_empaque: 519000,
      qr_url: null,
      colores: [],
      componentes: [
        { producto: { nombre: "Olla Arrocera N° 24" }, cantidad: 1 },
        { producto: { nombre: "Olla Honda N° 20" }, cantidad: 1 },
        { producto: { nombre: "Paila Cónica N° 34" }, cantidad: 1 },
      ],
    },
  ];
}

const CATEGORIA = {
  nombre: "Ollas",
  descripcion:
    "Ollas de aluminio de alta pureza fabricadas en Cali. Disponibles en varias medidas, con tapa y manijas en distintos colores. Precios por unidad y por empaque para distribuidores.",
};

/* ---------------- helpers ---------------- */

function detectarFormato(buf: Buffer): "png" | "jpg" | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50) return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  return null;
}

async function bajarQR(): Promise<{ url: string; img: PDFImagen } | null> {
  for (const url of QR_CANDIDATOS) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "AluminiosA4-PDF-SmokeTest/1.0 (test)" },
      });
      if (!res.ok) {
        console.log(`  QR remoto ${res.status} — ${url}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const format = detectarFormato(buf);
      if (!format) {
        console.log(`  QR remoto con formato no soportado — ${url}`);
        continue;
      }
      console.log(`  QR remoto OK (${buf.length} bytes, ${format}) — ${url}`);
      return { url, img: { data: buf, format } };
    } catch (e) {
      console.log(`  QR remoto falló: ${url} → ${(e as Error).message}`);
    }
  }
  return null;
}

/* ---- PNG sintético (fallback sin red): patrón tipo QR, 200x200 RGB ---- */
function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunkPNG(tipo: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(tipo, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function qrSintetico(): PDFImagen {
  const MOD = 25;
  const SCALE = 8;
  const W = MOD * SCALE;
  const negro = (mx: number, my: number) => {
    const finder = (ox: number, oy: number) => {
      const dx = mx - ox;
      const dy = my - oy;
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
      const anillo = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
      return anillo === 1 || anillo === 3 ? false : true;
    };
    for (const [ox, oy] of [
      [0, 0],
      [MOD - 7, 0],
      [0, MOD - 7],
    ] as const) {
      const f = finder(ox, oy);
      if (f !== null) return f;
    }
    return ((mx * 7 + my * 13 + ((mx * my) % 5)) % 3) === 0;
  };
  const raw = Buffer.alloc((W * 3 + 1) * W);
  let o = 0;
  for (let y = 0; y < W; y++) {
    raw[o++] = 0;
    for (let x = 0; x < W; x++) {
      const v = negro(Math.floor(x / SCALE), Math.floor(y / SCALE)) ? 0 : 255;
      raw[o++] = v;
      raw[o++] = v;
      raw[o++] = v;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(W, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type truecolor
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunkPNG("IHDR", ihdr),
    chunkPNG("IDAT", zlib.deflateSync(raw)),
    chunkPNG("IEND", Buffer.alloc(0)),
  ]);
  return { data: png, format: "png" };
}

async function escribir(nombre: string, element: React.ReactElement) {
  const buffer = await renderToBuffer(element as any);
  const out = path.join(OUT_DIR, nombre);
  fs.writeFileSync(out, buffer);
  const kb = (buffer.length / 1024).toFixed(1);
  console.log(`  ✔ ${nombre} — ${buffer.length} bytes (${kb} KB) → ${out}`);
  return buffer.length;
}

/* ---------------- main ---------------- */

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let logo: Buffer | null = null;
  try {
    logo = fs.readFileSync(path.join(process.cwd(), "public", "logo-a4.png"));
    console.log("  Logo encontrado: public/logo-a4.png");
  } catch {
    console.log("  Logo public/logo-a4.png no existe todavía → encabezado sin logo");
  }

  console.log("1) Descargando QR remoto de prueba…");
  const remoto = await bajarQR();
  const qr = remoto ?? {
    url: "https://ejemplo.local/qr/A4-171.png",
    img: qrSintetico(),
  };
  if (!remoto) {
    console.log("  Sin red para QR remoto → se usa un PNG sintético tipo QR (mismo camino de código: buffer → <Image>)");
  }

  // --- PDF principal: ruta de producción (QR pre-descargados) ---
  console.log("2) Render con QR pre-descargados (ruta de producción)…");
  const qrImages: Record<string, PDFImagen | null> = {
    [qr.url]: qr.img,
    // simula un QR cuya descarga falló → debe salir "QR pendiente"
    "https://ejemplo.invalido/qr-roto.png": null,
  };
  const size = await escribir(
    "test-catalogo.pdf",
    React.createElement(CatalogoPDF, {
      categoria: CATEGORIA,
      productos: productos(qr.url),
      juegos: [
        { ...juegos(qr.url)[0] },
        { ...juegos(null)[1], qr_url: "https://ejemplo.invalido/qr-roto.png" },
      ],
      fecha,
      logo,
      qrImages,
    })
  );

  // --- Variante: URL remota directa (sin pre-descarga) ---
  if (remoto) {
    console.log("3) Render con URL remota directa (sin pre-descarga)…");
    try {
      await escribir(
        "test-catalogo-remoto.pdf",
        React.createElement(CatalogoPDF, {
          categoria: CATEGORIA,
          productos: productos(remoto.url),
          juegos: juegos(remoto.url),
          fecha,
          logo,
        })
      );
    } catch (e) {
      console.log(`  ! Render remoto falló: ${(e as Error).message}`);
    }
  } else {
    console.log("3) (omitido) render con URL remota directa — sin red");
  }

  // --- Variante: todos los QR nulos ---
  console.log("4) Render sin ningún QR…");
  await escribir(
    "test-catalogo-sin-qr.pdf",
    React.createElement(CatalogoPDF, {
      categoria: CATEGORIA,
      productos: productos(null),
      juegos: juegos(null),
      fecha,
      logo,
    })
  );

  // --- Variante: categoría vacía ---
  console.log("5) Render de categoría vacía…");
  await escribir(
    "test-catalogo-vacio.pdf",
    React.createElement(CatalogoPDF, {
      categoria: { nombre: "Chocolateras", descripcion: "Sin referencias publicadas." },
      productos: [],
      juegos: [],
      fecha,
      logo,
    })
  );

  // --- Variante: muchas referencias (paginación + pie fijo) ---
  console.log("6) Render con 40 productos (paginación)…");
  const muchos = Array.from({ length: 8 }, () => productos(qr.url)).flat();
  await escribir(
    "test-catalogo-largo.pdf",
    React.createElement(CatalogoPDF, {
      categoria: CATEGORIA,
      productos: muchos.map((p, i) => ({ ...p, id: `m${i}` })),
      juegos: juegos(qr.url),
      fecha,
      logo,
      qrImages,
    })
  );

  if (size < 10 * 1024) {
    console.error(`\n✖ El PDF principal pesa ${size} bytes (< 10 KB). Revisar.`);
    process.exit(1);
  }
  console.log("\n✔ Smoke test OK");
}

main().catch((e) => {
  console.error("✖ Falló el smoke test:", e);
  process.exit(1);
});
