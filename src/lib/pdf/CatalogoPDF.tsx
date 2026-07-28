/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatCOP, cm } from "@/lib/format";

/* ------------------------------------------------------------------ *
 * Paleta de marca Aluminios A4
 * ------------------------------------------------------------------ */
const C = {
  turquesa: "#32CCD8",
  turquesaOscuro: "#1B8894",
  turquesaSuave: "#EAFBFD",
  turquesaBorde: "#A9ECF2",
  coral: "#EF7748",
  navy: "#22323C",
  gris: "#64748B",
  borde: "#E2E8F0",
  bordeSuave: "#F1F5F9",
  blanco: "#FFFFFF",
} as const;

const EMPRESA =
  "Aluminios A4 · 100% Aluminio de Calidad · Cl. 36 #4-19, Comuna 4, Cali · +57 350 822 8479";

const NOTA_QR =
  "Escanea el código QR de cada referencia para realizar tu pedido en el sistema de Aluminios A4.";

/* ------------------------------------------------------------------ *
 * Tipos de props (estructurales: aceptan ProductoConColores / JuegoConDetalle)
 * ------------------------------------------------------------------ */
export interface PDFColor {
  nombre: string;
  hex: string | null;
}

export interface PDFProducto {
  id?: string;
  nombre: string;
  referencia?: string | null;
  diametro_cm?: number | null;
  altura_cm?: number | null;
  capacidad?: string | null;
  colores_manija?: string | null;
  refuerzo?: boolean;
  empaque?: string | null;
  precio: number;
  precio_empaque?: number | null;
  qr_url?: string | null;
  colores?: PDFColor[];
}

export interface PDFJuego {
  id?: string;
  nombre: string;
  referencia?: string | null;
  refuerzo?: boolean;
  empaque?: string | null;
  precio: number;
  precio_empaque?: number | null;
  qr_url?: string | null;
  colores?: PDFColor[];
  componentes?: { producto: { nombre: string }; cantidad: number }[];
}

/** Imagen ya descargada (evita que un QR inalcanzable rompa todo el PDF). */
export interface PDFImagen {
  data: Buffer;
  format: "png" | "jpg";
}

export interface CatalogoPDFProps {
  categoria: { nombre: string; descripcion?: string | null };
  productos: PDFProducto[];
  juegos: PDFJuego[];
  fecha: string;
  logo?: Buffer | null;
  /**
   * Mapa qr_url -> imagen ya descargada. Si se entrega, las celdas usan estos
   * buffers y muestran "QR pendiente" cuando la descarga falló (valor null).
   * Si NO se entrega, se usa la URL remota directamente.
   */
  qrImages?: Record<string, PDFImagen | null>;
}

/* ------------------------------------------------------------------ *
 * Estilos
 * ------------------------------------------------------------------ */
const s = StyleSheet.create({
  page: {
    // El padding de la página se aplica en TODAS las páginas (a diferencia del
    // padding del contenedor interno, que solo cuenta en la primera).
    paddingTop: 26,
    paddingBottom: 54,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.navy,
    backgroundColor: C.blanco,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: C.turquesa,
  },
  body: { paddingHorizontal: 36, flexGrow: 1 },

  /* Encabezado */
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  logo: { height: 64, maxWidth: 190, objectFit: "contain" },
  marcaFallback: { justifyContent: "flex-start" },
  marcaFallbackTitulo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 19,
    color: C.navy,
    letterSpacing: 1,
  },
  marcaFallbackSub: { fontSize: 7.5, color: C.turquesaOscuro, marginTop: 3 },
  headerRight: { alignItems: "flex-end", maxWidth: "62%" },
  kicker: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: C.coral,
    letterSpacing: 2,
  },
  titulo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: C.navy,
    marginTop: 5,
    textAlign: "right",
  },
  fecha: { fontSize: 9, color: C.gris, marginTop: 4 },
  descripcion: { fontSize: 10, color: C.gris, marginTop: 16, lineHeight: 1.45 },

  nota: {
    marginTop: 12,
    backgroundColor: C.turquesaSuave,
    borderWidth: 1,
    borderColor: C.turquesaBorde,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  notaTexto: { fontSize: 9, color: C.navy, flex: 1 },

  /* Secciones */
  seccion: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 9,
  },
  seccionGuion: {
    width: 16,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: C.coral,
    marginRight: 7,
  },
  seccionTitulo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: C.navy,
  },
  seccionConteo: { fontSize: 8, color: C.gris, marginLeft: 6 },

  /* Cuadrícula */
  fila: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  celda: {
    width: "49%",
    borderWidth: 1,
    borderColor: C.borde,
    borderRadius: 8,
    padding: 10,
  },
  celdaVacia: { width: "49%" },

  celdaTop: { flexDirection: "row", alignItems: "flex-start" },
  celdaInfo: { flex: 1, paddingRight: 7 },
  nombre: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: C.navy,
    lineHeight: 1.2,
  },
  referencia: { fontSize: 7.5, color: C.gris, marginTop: 2.5 },

  chip: {
    alignSelf: "flex-start",
    marginTop: 5,
    backgroundColor: C.coral,
    borderRadius: 99,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  chipTexto: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: C.blanco,
    letterSpacing: 0.4,
  },

  qr: { width: 58, height: 58, objectFit: "contain" },
  qrVacio: {
    width: 58,
    height: 58,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  qrVacioTexto: { fontSize: 6, color: C.gris, textAlign: "center" },

  specs: { fontSize: 8, color: C.gris, marginTop: 7 },

  etiquetaMini: {
    fontSize: 6,
    color: C.gris,
    letterSpacing: 0.6,
    marginBottom: 2.5,
  },
  coloresFila: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  colorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 7,
    marginBottom: 1.5,
  },
  colorPunto: {
    width: 7,
    height: 7,
    borderRadius: 99,
    borderWidth: 0.5,
    borderColor: C.borde,
    marginRight: 3,
  },
  colorNombre: { fontSize: 7, color: C.gris },

  detalle: { fontSize: 7.5, color: C.gris, marginTop: 5, lineHeight: 1.3 },

  pie: {
    marginTop: 8,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: C.bordeSuave,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  pieIzq: { flex: 1, paddingRight: 6 },
  pieTexto: { fontSize: 7.5, color: C.gris },
  precioCaja: { alignItems: "flex-end" },
  precioEtiqueta: { fontSize: 6, color: C.gris, letterSpacing: 0.6 },
  precio: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: C.turquesaOscuro,
    marginTop: 1,
  },

  /* Estado vacío */
  vacio: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  vacioTexto: { fontSize: 11, color: C.gris, textAlign: "center" },

  /* Pie de página */
  footer: {
    position: "absolute",
    bottom: 22,
    left: 36,
    right: 36,
  },
  footerLinea: { height: 1, backgroundColor: C.borde, marginBottom: 6 },
  footerFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerTexto: { fontSize: 7, color: C.gris },
});

/* ------------------------------------------------------------------ *
 * Utilidades
 * ------------------------------------------------------------------ */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function specsDe(p: PDFProducto): string | null {
  const partes: string[] = [];
  const d = cm(p.diametro_cm);
  const a = cm(p.altura_cm);
  if (d) partes.push(`Ø ${d}`);
  if (a) partes.push(`Alto ${a}`);
  if (p.capacidad) partes.push(p.capacidad);
  return partes.length ? partes.join("  ·  ") : null;
}

function incluyeDe(j: PDFJuego): string | null {
  const items = (j.componentes ?? [])
    .filter((c) => c?.producto?.nombre)
    .map((c) =>
      c.cantidad && c.cantidad > 1
        ? `${c.cantidad}× ${c.producto.nombre}`
        : c.producto.nombre
    );
  return items.length ? items.join(" · ") : null;
}

/* ------------------------------------------------------------------ *
 * Piezas
 * ------------------------------------------------------------------ */
function QR({
  url,
  qrImages,
}: {
  url?: string | null;
  qrImages?: Record<string, PDFImagen | null>;
}) {
  const pendiente = (
    <View style={s.qrVacio}>
      <Text style={s.qrVacioTexto}>QR{"\n"}pendiente</Text>
    </View>
  );

  if (!url) return pendiente;

  if (qrImages) {
    const img = qrImages[url];
    if (!img) return pendiente;
    return <Image style={s.qr} src={{ data: img.data, format: img.format }} />;
  }

  return <Image style={s.qr} src={url} />;
}

function Colores({ colores }: { colores?: PDFColor[] }) {
  const list = (colores ?? []).filter((c) => c && c.nombre);
  if (!list.length) return null;
  const visibles = list.slice(0, 4);
  const resto = list.length - visibles.length;

  return (
    <View style={{ marginTop: 7 }}>
      <Text style={s.etiquetaMini}>COLOR DE TAPA</Text>
      <View style={s.coloresFila}>
        {visibles.map((c, i) => (
          <View key={`${c.nombre}-${i}`} style={s.colorItem}>
            <View
              style={[s.colorPunto, { backgroundColor: c.hex || "#CBD5E1" }]}
            />
            <Text style={s.colorNombre}>{c.nombre}</Text>
          </View>
        ))}
        {resto > 0 && <Text style={s.colorNombre}>+{resto}</Text>}
      </View>
    </View>
  );
}

function Celda({
  item,
  tipo,
  qrImages,
}: {
  item: PDFProducto | PDFJuego;
  tipo: "producto" | "juego";
  qrImages?: Record<string, PDFImagen | null>;
}) {
  const esJuego = tipo === "juego";
  const producto = item as PDFProducto;
  const juego = item as PDFJuego;

  const specs = esJuego ? null : specsDe(producto);
  const incluye = esJuego ? incluyeDe(juego) : null;
  const precioEmpaque =
    typeof item.precio_empaque === "number" &&
    item.precio_empaque > 0 &&
    item.precio_empaque !== item.precio
      ? item.precio_empaque
      : null;

  return (
    <View style={s.celda}>
      <View style={s.celdaTop}>
        <View style={s.celdaInfo}>
          <Text style={s.nombre}>{item.nombre}</Text>
          {!!item.referencia && (
            <Text style={s.referencia}>Ref. {item.referencia}</Text>
          )}
          {!!item.refuerzo && (
            <View style={s.chip}>
              <Text style={s.chipTexto}>CON REFUERZO</Text>
            </View>
          )}
        </View>
        <QR url={item.qr_url} qrImages={qrImages} />
      </View>

      {!!specs && <Text style={s.specs}>{specs}</Text>}

      {!!incluye && (
        <View style={{ marginTop: 7 }}>
          <Text style={s.etiquetaMini}>INCLUYE</Text>
          <Text
            style={[
              s.detalle,
              { marginTop: 0, maxLines: 3, textOverflow: "ellipsis" },
            ]}
          >
            {incluye}
          </Text>
        </View>
      )}

      <Colores colores={item.colores} />

      {!esJuego && !!producto.colores_manija && (
        <Text style={s.detalle}>Manija: {producto.colores_manija}</Text>
      )}

      <View style={s.pie}>
        <View style={s.pieIzq}>
          {!!item.empaque && (
            <Text style={s.pieTexto}>Empaque: {item.empaque}</Text>
          )}
          {precioEmpaque !== null && (
            <Text style={s.pieTexto}>
              Precio empaque: {formatCOP(precioEmpaque)}
            </Text>
          )}
        </View>
        <View style={s.precioCaja}>
          <Text style={s.precioEtiqueta}>
            {esJuego ? "PRECIO JUEGO" : "PRECIO UNIDAD"}
          </Text>
          <Text style={s.precio}>{formatCOP(item.precio)}</Text>
        </View>
      </View>
    </View>
  );
}

function Cuadricula({
  items,
  tipo,
  qrImages,
}: {
  items: (PDFProducto | PDFJuego)[];
  tipo: "producto" | "juego";
  qrImages?: Record<string, PDFImagen | null>;
}) {
  return (
    <>
      {chunk(items, 2).map((fila, i) => (
        <View key={`fila-${tipo}-${i}`} style={s.fila} wrap={false}>
          {fila.map((item, j) => (
            <Celda
              key={item.id ?? `${tipo}-${i}-${j}`}
              item={item}
              tipo={tipo}
              qrImages={qrImages}
            />
          ))}
          {fila.length === 1 && <View style={s.celdaVacia} />}
        </View>
      ))}
    </>
  );
}

function TituloSeccion({ texto, conteo }: { texto: string; conteo: number }) {
  return (
    <View style={s.seccion} wrap={false} minPresenceAhead={140}>
      <View style={s.seccionGuion} />
      <Text style={s.seccionTitulo}>{texto}</Text>
      <Text style={s.seccionConteo}>({conteo})</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Documento
 * ------------------------------------------------------------------ */
export default function CatalogoPDF({
  categoria,
  productos,
  juegos,
  fecha,
  logo,
  qrImages,
}: CatalogoPDFProps) {
  const hayProductos = productos.length > 0;
  const hayJuegos = juegos.length > 0;
  const vacio = !hayProductos && !hayJuegos;

  return (
    <Document
      title={`Catálogo ${categoria.nombre} — Aluminios A4`}
      author="Aluminios A4"
      subject={`Catálogo de ${categoria.nombre}`}
      creator="Aluminios A4"
      producer="Aluminios A4"
    >
      <Page size="A4" style={s.page}>
        <View style={s.topBar} fixed />

        <View style={s.body}>
          {/* Encabezado */}
          <View style={s.header}>
            {logo ? (
              <Image style={s.logo} src={{ data: logo, format: "png" }} />
            ) : (
              <View style={s.marcaFallback}>
                <Text style={s.marcaFallbackTitulo}>ALUMINIOS A4</Text>
                <Text style={s.marcaFallbackSub}>
                  100% Aluminio de Calidad
                </Text>
              </View>
            )}

            <View style={s.headerRight}>
              <Text style={s.kicker}>CATÁLOGO</Text>
              <Text style={s.titulo}>{categoria.nombre}</Text>
              <Text style={s.fecha}>Generado el {fecha}</Text>
            </View>
          </View>

          {!!categoria.descripcion && (
            <Text style={s.descripcion}>{categoria.descripcion}</Text>
          )}

          <View style={s.nota}>
            <View style={s.seccionGuion} />
            <Text style={s.notaTexto}>{NOTA_QR}</Text>
          </View>

          {/* Contenido */}
          {vacio ? (
            <View style={s.vacio}>
              <Text style={s.vacioTexto}>
                Esta categoría no tiene referencias publicadas actualmente.
              </Text>
            </View>
          ) : (
            <>
              {hayProductos && (
                <>
                  <TituloSeccion
                    texto="Referencias individuales"
                    conteo={productos.length}
                  />
                  <Cuadricula
                    items={productos}
                    tipo="producto"
                    qrImages={qrImages}
                  />
                </>
              )}

              {hayJuegos && (
                <>
                  <TituloSeccion texto="Juegos" conteo={juegos.length} />
                  <Cuadricula items={juegos} tipo="juego" qrImages={qrImages} />
                </>
              )}
            </>
          )}
        </View>

        {/* Pie fijo */}
        <View style={s.footer} fixed>
          <View style={s.footerLinea} />
          <View style={s.footerFila}>
            <Text style={s.footerTexto}>{EMPRESA}</Text>
            <Text
              style={s.footerTexto}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
