// Carga el catalogo real de Aluminios A4 (CSV v2) a Supabase: categorias,
// productos, colores de tapa, juegos, colores de juego y componentes de juego.
//
// Uso:
//   node --env-file=.env.local scripts/load-referencias.mjs --dry   (solo parsea y reporta)
//   node --env-file=.env.local scripts/load-referencias.mjs         (escribe en la base)
//
// Los QR NO se asignan aqui: eso lo hace scripts/assign-qrs.mjs.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DRY = process.argv.includes('--dry')

const CSV_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  'insumos',
  'REFERENCIAS ARTICULOS EXCEL ACTUALIZADO v2.csv',
)

/* ------------------------------------------------------------ entorno ---- */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'catalogo'

if (!SUPABASE_URL) {
  console.error(
    'ERROR: falta NEXT_PUBLIC_SUPABASE_URL en el entorno.\n' +
      '  Corre con: node --env-file=.env.local scripts/load-referencias.mjs',
  )
  process.exit(1)
}
if (!DRY && !SERVICE_KEY) {
  console.error('ERROR: falta SUPABASE_SERVICE_ROLE_KEY en el entorno (.env.local)')
  process.exit(1)
}

// La base de Storage SIEMPRE sale del entorno: nunca se hardcodea un proyecto.
const STORAGE_BASE = `${SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}`

const supabase = SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null

const anomalias = []
const erratas = []

/* ---------------------------------------------------------------- CSV ---- */
function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\r') {
      // ignorar
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function readCsvText() {
  let text = readFileSync(CSV_PATH, 'utf8')
  if (text.includes('�')) {
    anomalias.push('CSV con caracteres invalidos en utf8: se releyo como latin1')
    text = readFileSync(CSV_PATH, 'latin1')
  }
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  return text
}

/* ------------------------------------------------------------ helpers ---- */
const clean = (v) => (v == null ? '' : String(v).replace(/\s+/g, ' ').trim())

function normalizarNombre(raw) {
  let s = String(raw || '').replace(/\s+/g, ' ').trim()
  s = s.replace(/([A-Za-zÁÉÍÓÚÑáéíóúñ])#/g, '$1 #') // MANIJA# -> MANIJA #
  s = s.replace(/#\s+/g, '#') // "# 24" -> "#24"
  const UPPER = new Set(['CT', 'ST', 'LT'])
  return s
    .split(' ')
    .filter(Boolean)
    .map((tok) => {
      const up = tok.toUpperCase()
      if (UPPER.has(up)) return up
      if (up === 'X') return 'x'
      if (/^\d+X\d+$/.test(up)) return up.toLowerCase()
      if (tok.startsWith('#')) return tok
      return tok.charAt(0).toUpperCase() + tok.slice(1).toLowerCase()
    })
    .join(' ')
}

function num(v) {
  const s = clean(v)
  if (!s) return null
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

// v2: la columna "UNIDAD DE EMPAQUE" es numerica. 1 -> Unidad, N -> Caja x N.
function normalizarEmpaque(raw, ctx) {
  const s = clean(raw)
  if (!s) return null
  const n = parseInt(s, 10)
  if (Number.isFinite(n) && String(n) === s.replace(/\s/g, '')) {
    return n <= 1 ? 'Unidad' : `Caja x ${n}`
  }
  anomalias.push(`UNIDAD DE EMPAQUE no numerica ("${s}") en ${ctx} -> se deja el texto tal cual`)
  return s
}

function unidadesEmpaque(raw) {
  const n = parseInt(clean(raw), 10)
  return Number.isFinite(n) ? n : null
}

const COLOR_PATTERNS = [
  [/^NEGRA/, 'Negra'],
  [/^NEGRO/, 'Negra'],
  [/^NEGR/, 'Negra'],
  [/^ROJA/, 'Roja'],
  [/^ROJO/, 'Roja'],
  [/^AZUL/, 'Azul'],
  [/^VERDE/, 'Verde'],
  [/^PLATEADA/, 'Plateada'],
  [/^CHAMPETA/, 'Champeta'],
]

function separarColores(token) {
  // Separa tokens pegados como "ROJAVERDE" usando los colores conocidos.
  const out = []
  let rest = token.toUpperCase()
  let guard = 0
  while (rest.length && guard++ < 30) {
    let matched = false
    for (const [re, nombre] of COLOR_PATTERNS) {
      const m = rest.match(re)
      if (m) {
        out.push(nombre)
        rest = rest.slice(m[0].length)
        matched = true
        break
      }
    }
    if (!matched) {
      let idx = -1
      for (let i = 1; i < rest.length; i++) {
        if (COLOR_PATTERNS.some(([re]) => re.test(rest.slice(i)))) {
          idx = i
          break
        }
      }
      const chunk = idx === -1 ? rest : rest.slice(0, idx)
      rest = idx === -1 ? '' : rest.slice(idx)
      const c = chunk.trim()
      if (c) out.push(c.charAt(0) + c.slice(1).toLowerCase())
    }
  }
  return out
}

function normalizarColoresManija(raw, ctx) {
  const s = clean(raw)
  if (!s || /^x$/i.test(s)) return null
  const tokens = s
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t && !/^y$/i.test(t) && !/^x$/i.test(t))
  const out = []
  for (const t of tokens) {
    for (const c of separarColores(t)) if (!out.includes(c)) out.push(c)
  }
  if (!out.length) {
    anomalias.push(`Colores de manija no interpretables ("${s}") en ${ctx}`)
    return null
  }
  return out.join(', ')
}

const TAPA_DEFS = [
  { test: /ROJ/i, nombre: 'Rojo', hex: '#E23B33' },
  { test: /AZUL/i, nombre: 'Azul', hex: '#2450C4' },
  { test: /PLATEADA/i, nombre: 'Plateada', hex: '#C9CED4' },
]

function coloresTapa(raw) {
  const s = clean(raw)
  if (!s || /^x$/i.test(s)) return []
  return TAPA_DEFS.filter((d) => d.test.test(s)).map((d) => ({
    nombre: d.nombre,
    hex: d.hex,
  }))
}

function normalizarPrecio(raw) {
  const s = clean(raw).replace(/["$,\s]/g, '')
  if (!s || /^pendiente$/i.test(s)) return null
  const n = parseFloat(s)
  return Number.isFinite(n) ? Math.round(n) : null
}

const CAT_RULES = [
  [/^OLLA\b/i, 'Ollas'],
  [/^CALDERO\b/i, 'Calderos'],
  [/^PAILA\b/i, 'Pailas'],
  [/^JARR[AO]\b/i, 'Jarras y Jarros'],
  [/^CHOCOLATERA\b/i, 'Chocolateras'],
  [/^(TORTERO|ESCURRIDOR|ACEITERO|LECHERO|SOPERA|VAPORERA|INDIO)\b/i, 'Complementos'],
]

function categoriaDe(articulo, ctx) {
  const s = clean(articulo)
  for (const [re, cat] of CAT_RULES) if (re.test(s)) return cat
  anomalias.push(`Sin regla de categoria para "${s}" (${ctx}) -> Complementos`)
  return 'Complementos'
}

/* --------------------------------------------------------- categorias ---- */
const CATEGORIAS = [
  {
    slug: 'ollas',
    nombre: 'Ollas',
    orden: 1,
    descripcion:
      'Ollas en aluminio de alta calidad: manija, asa, especial, ovaladas y buffet.',
  },
  {
    slug: 'calderos',
    nombre: 'Calderos',
    orden: 2,
    descripcion:
      'Calderos con y sin refuerzo, desde uso diario hasta tamaños industriales.',
  },
  {
    slug: 'pailas',
    nombre: 'Pailas',
    orden: 3,
    descripcion: 'Pailas con manija, asa y mango, con o sin tapa.',
  },
  {
    slug: 'jarras-y-jarros',
    nombre: 'Jarras y Jarros',
    orden: 4,
    descripcion: 'Jarras, jarras mango y jarros en varios tamaños.',
  },
  {
    slug: 'chocolateras',
    nombre: 'Chocolateras',
    orden: 5,
    descripcion: 'Chocolateras clásicas y recortadas.',
  },
  {
    slug: 'complementos',
    nombre: 'Complementos',
    orden: 6,
    descripcion: 'Torteros, escurridores, lecheros, soperas, vaporeras y más.',
  },
]

/* ------------------------------------------------- imagenes especiales ----
 * Solo hay fotos reales para unas pocas referencias (demo). El resto del
 * catalogo usa el placeholder del sitio hasta que el admin suba sus fotos.
 *
 * NOTA: el mapeo A4-155 -> caldero-24-*.png viene de la carga v1 y NO coincide
 * con el articulo (A4-155 es "Olla Especial Aro #14"). Ver reporte de erratas.
 */
const IMAGENES_PRODUCTO = {
  'A4-171': { Rojo: '/productos/olla-manija-14-rojo.png', Azul: '/productos/olla-manija-14-azul.png' },
  'A4-172': { Rojo: '/productos/olla-manija-16-rojo.png', Azul: '/productos/olla-manija-16-azul.png' },
  'A4-155': { Rojo: '/productos/caldero-24-rojo.png', Azul: '/productos/caldero-24-azul.png' },
}
const IMAGENES_JUEGO = {
  'A4-312': { Rojo: '/juegos/juego-olla-manija-rojo.png', Azul: '/juegos/juego-olla-manija-azul.png' },
  'A4-384': { Rojo: '/juegos/juego-olla-premium-rojo.png', Azul: '/juegos/juego-olla-premium-azul.png' },
}
const DESTACADOS_PRODUCTO = new Set(['A4-171', 'A4-172', 'A4-155', 'A4-189'])
const DESTACADOS_JUEGO = new Set(['A4-312', 'A4-384'])

/* -------------------------------------------------------------- juegos ---- */
const JUEGO_RE = /^JUEGO\s+(?:DE\s+)?(.+?)\s*\*\s*(\d+)\s+(\S+)\s*(CT|ST)?$/i

// familia del CSV -> {base para el nombre del componente, categoria, lleva sufijo CT/ST}
const FAMILIAS = [
  { test: /^CALDERO\s+UNIVERSAL$/i, base: 'Caldero', categoria: 'Calderos', sufijoTapa: false },
  { test: /^CALDERO$/i, base: 'Caldero', categoria: 'Calderos', sufijoTapa: false },
  { test: /^OLLA\s+MANIJA$/i, base: 'Olla Manija', categoria: 'Ollas', sufijoTapa: false },
  { test: /^OLLA\s+ASA$/i, base: 'Olla Asa', categoria: 'Ollas', sufijoTapa: false },
  { test: /^OLLA\s+PREMIUM$/i, base: 'Olla Premium', categoria: 'Ollas', sufijoTapa: false },
  { test: /^PAILA\s+MANGO$/i, base: 'Paila Mango', categoria: 'Pailas', sufijoTapa: true },
  { test: /^PAILA\s+MANIJA$/i, base: 'Paila Manija', categoria: 'Pailas', sufijoTapa: true },
  { test: /^PAILA\s+ASA$/i, base: 'Paila Asa', categoria: 'Pailas', sufijoTapa: true },
]

function familiaDe(familiaRaw, ctx) {
  const s = clean(familiaRaw)
  const f = FAMILIAS.find((x) => x.test.test(s))
  if (f) return f
  anomalias.push(`Familia de juego desconocida "${s}" (${ctx}) -> sin componentes`)
  return null
}

// "14-22" -> [14,16,18,20,22];  "30-40x25" -> [30,32,34,36,38] + comodin "40x25"
function tallasDeRango(rango, base, ctx) {
  const s = clean(rango)
  const comodin = s.match(/^(\d+)-(\d+)x(\d+)$/i)
  if (comodin) {
    const [, a, b, c] = comodin.map(Number)
    const nombres = []
    for (let n = a; n <= b - 2; n += 2) nombres.push(`${base} #${n}`)
    nombres.push(`${base} ${b} x ${c}`)
    return nombres
  }
  const simple = s.match(/^(\d+)-(\d+)$/)
  if (simple) {
    const [, a, b] = simple.map(Number)
    const nombres = []
    for (let n = a; n <= b; n += 2) nombres.push(`${base} #${n}`)
    return nombres
  }
  anomalias.push(`Rango de juego no interpretable "${s}" (${ctx})`)
  return []
}

/* ------------------------------------------------------------- utiles ---- */
function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function detectarErratas(p, ctx, unidades) {
  if (p.diametro_cm != null && p.diametro_cm < 5) {
    erratas.push(
      `${p.referencia ?? 'sin ref'} · ${p.nombre}: DIAMETRO ${p.diametro_cm} cm es implausible (< 5 cm) [${ctx}]`,
    )
  }
  const m = p.nombre.match(/#(\d+)\b/)
  if (m && p.diametro_cm != null) {
    const talla = Number(m[1])
    if (talla >= 10 && talla <= 60 && Math.abs(p.diametro_cm - talla) > 3) {
      erratas.push(
        `${p.referencia ?? 'sin ref'} · ${p.nombre}: DIAMETRO ${p.diametro_cm} cm no coincide con la talla #${talla} (altura ${p.altura_cm}) [${ctx}]`,
      )
    }
  }
  if (unidades && p.precio && p.precio_empaque != null) {
    const esperado = p.precio * unidades
    if (Math.abs(p.precio_empaque - esperado) > 1) {
      erratas.push(
        `${p.referencia ?? 'sin ref'} · ${p.nombre}: PRECIO VENTA ${p.precio_empaque} != PRECIO POR UNIDAD ${p.precio} x ${unidades} empaque (= ${esperado}) [${ctx}]`,
      )
    }
  }
}

/* --------------------------------------------------------------- main ---- */
async function main() {
  const rows = parseCSV(readCsvText())
  const header = rows[0].map((h) => clean(h).toUpperCase())
  const idx = (name) => header.findIndex((h) => h === name)
  const I = {
    codigo: idx('CODIGO'),
    articulo: idx('ARTICULO'),
    diametro: idx('DIAMETRO'),
    altura: idx('ALTURA'),
    empaque: idx('UNIDAD DE EMPAQUE'),
    manija: idx('COLORES DE MANIJA'),
    tapa: idx('COLORES DE TAPA'),
    precio: idx('PRECIO POR UNIDAD'),
    precioVenta: idx('PRECIO VENTA'),
  }
  for (const [k, v] of Object.entries(I)) {
    if (v === -1) throw new Error(`Columna no encontrada en el CSV: ${k}`)
  }

  const dataRows = []
  rows.slice(1).forEach((r, i) => {
    if (!r.some((c) => clean(c) !== '')) return // fila totalmente vacia
    if (clean(r[I.articulo]) === '') return
    dataRows.push({ r, csvLine: i + 2 })
  })

  const productos = []
  const juegosRaw = []
  const saltadosPendiente = []
  const sinReferencia = []
  const refsVistas = new Map()

  for (const { r, csvLine } of dataRows) {
    const ctx = `fila CSV ${csvLine}`
    const articuloRaw = clean(r[I.articulo])
    const codigo = clean(r[I.codigo]).toUpperCase()

    if (/^PENDIENTE$/i.test(codigo)) {
      saltadosPendiente.push(`${normalizarNombre(articuloRaw)} (${ctx})`)
      continue
    }

    let referencia = null
    if (/^A4-\d+$/i.test(codigo)) referencia = codigo
    else if (codigo) {
      anomalias.push(`CODIGO no reconocido "${codigo}" en ${ctx} -> referencia null`)
    }

    const esJuego = /^JUEGO\b/i.test(articuloRaw)
    const nombre = esJuego ? null : normalizarNombre(articuloRaw)

    if (referencia) {
      if (refsVistas.has(referencia)) {
        anomalias.push(
          `Referencia duplicada ${referencia} (${refsVistas.get(referencia)} y ${nombre ?? articuloRaw})`,
        )
      } else refsVistas.set(referencia, nombre ?? articuloRaw)
    } else {
      sinReferencia.push(`${nombre ?? articuloRaw} (${ctx})`)
    }

    const precio = normalizarPrecio(r[I.precio]) ?? 0
    const precioEmpaque = normalizarPrecio(r[I.precioVenta])
    const unidades = unidadesEmpaque(r[I.empaque])
    const tapas = coloresTapa(r[I.tapa])

    if (esJuego) {
      juegosRaw.push({ r, ctx, referencia, articuloRaw, precio, precioEmpaque, unidades, tapas })
      continue
    }

    const imgs = referencia ? IMAGENES_PRODUCTO[referencia] : null
    const producto = {
      nombre,
      referencia,
      descripcion: null,
      diametro_cm: num(r[I.diametro]),
      altura_cm: num(r[I.altura]),
      capacidad: null,
      colores_manija: normalizarColoresManija(r[I.manija], ctx),
      refuerzo: false,
      empaque: normalizarEmpaque(r[I.empaque], ctx),
      precio,
      precio_empaque: precioEmpaque,
      imagen_url: imgs ? STORAGE_BASE + imgs.Rojo : null,
      qr_url: null,
      destacado: referencia ? DESTACADOS_PRODUCTO.has(referencia) : false,
      activo: true,
      orden: (productos.length + 1) * 10,
    }
    if (producto.diametro_cm == null && clean(r[I.diametro]))
      anomalias.push(`DIAMETRO no numerico "${clean(r[I.diametro])}" en ${ctx}`)
    if (producto.altura_cm == null && clean(r[I.altura]))
      anomalias.push(`ALTURA no numerica "${clean(r[I.altura])}" en ${ctx}`)
    if (precioEmpaque == null) anomalias.push(`PRECIO VENTA vacio en ${ctx} (${nombre})`)

    detectarErratas(producto, ctx, unidades)

    productos.push({
      producto,
      categoria: categoriaDe(articuloRaw, ctx),
      colores: tapas.map((t, k) => ({
        nombre: t.nombre,
        hex: t.hex,
        imagen_url: imgs && imgs[t.nombre] ? STORAGE_BASE + imgs[t.nombre] : null,
        orden: k,
      })),
    })
  }

  /* --- juegos: nombre, categoria y componentes -------------------------- */
  const porNombre = new Map()
  for (const it of productos) {
    if (!porNombre.has(it.producto.nombre)) porNombre.set(it.producto.nombre, it)
  }

  const juegos = []
  for (const j of juegosRaw) {
    const m = j.articuloRaw.match(JUEGO_RE)
    if (!m) {
      anomalias.push(`ARTICULO de juego no parseable "${j.articuloRaw}" (${j.ctx}) -> se salta`)
      continue
    }
    const [, familiaRaw, piezasRaw, rangoRaw, tapaRaw] = m
    const piezas = parseInt(piezasRaw, 10)
    const tapa = tapaRaw ? tapaRaw.toUpperCase() : null
    const fam = familiaDe(familiaRaw, j.ctx)

    const nombre = [
      'Juego',
      normalizarNombre(familiaRaw),
      `x${piezas}`,
      clean(rangoRaw).toLowerCase(),
      tapa,
    ]
      .filter(Boolean)
      .join(' ')

    let nombresComponentes = []
    if (fam) {
      const sufijo = fam.sufijoTapa ? ` ${tapa || 'CT'}` : ''
      nombresComponentes = tallasDeRango(rangoRaw, fam.base, j.ctx).map((n) => n + sufijo)
    }

    const resueltos = []
    const noResueltos = []
    nombresComponentes.forEach((n, k) => {
      const it = porNombre.get(n)
      if (it) resueltos.push({ nombreProducto: n, orden: k })
      else noResueltos.push(n)
    })

    if (nombresComponentes.length && nombresComponentes.length !== piezas) {
      anomalias.push(
        `Juego ${j.referencia ?? 'sin ref'} "${nombre}": el rango produce ${nombresComponentes.length} piezas pero el articulo dice ${piezas}`,
      )
    }

    const imgs = j.referencia ? IMAGENES_JUEGO[j.referencia] : null
    juegos.push({
      juego: {
        nombre,
        referencia: j.referencia,
        descripcion: null,
        refuerzo: false,
        empaque: '1 x Caja',
        precio: j.precio,
        imagen_url: imgs ? STORAGE_BASE + imgs.Rojo : null,
        qr_url: null,
        destacado: j.referencia ? DESTACADOS_JUEGO.has(j.referencia) : false,
        activo: true,
        orden: (juegos.length + 1) * 10,
      },
      categoria: fam ? fam.categoria : categoriaDe(familiaRaw, j.ctx),
      colores: j.tapas.map((t, k) => ({
        nombre: t.nombre,
        hex: t.hex,
        imagen_url: imgs && imgs[t.nombre] ? STORAGE_BASE + imgs[t.nombre] : null,
        orden: k,
      })),
      piezas,
      resueltos,
      noResueltos,
      ctx: j.ctx,
    })

    if (j.precioEmpaque != null && Math.abs(j.precioEmpaque - j.precio) > 1) {
      erratas.push(
        `${j.referencia ?? 'sin ref'} · ${nombre}: PRECIO VENTA ${j.precioEmpaque} != PRECIO POR UNIDAD ${j.precio}`,
      )
    }
  }

  /* --- reporte de parseo ------------------------------------------------ */
  const porCategoriaP = {}
  for (const it of productos) porCategoriaP[it.categoria] = (porCategoriaP[it.categoria] || 0) + 1
  const porCategoriaJ = {}
  for (const it of juegos) porCategoriaJ[it.categoria] = (porCategoriaJ[it.categoria] || 0) + 1

  const totalColoresProd = productos.reduce((a, it) => a + it.colores.length, 0)
  const totalColoresJue = juegos.reduce((a, it) => a + it.colores.length, 0)
  const totalComponentes = juegos.reduce((a, it) => a + it.resueltos.length, 0)
  const juegosCompletos = juegos.filter((j) => j.noResueltos.length === 0)
  const juegosIncompletos = juegos.filter((j) => j.noResueltos.length > 0)

  console.log('\n=============== REPORTE DE PARSEO ===============')
  console.log(`CSV                    : ${path.basename(CSV_PATH)}`)
  console.log(`Storage base           : ${STORAGE_BASE}`)
  console.log(`Filas de datos         : ${dataRows.length}`)
  console.log(`Productos              : ${productos.length}`)
  console.log(`Juegos                 : ${juegos.length}`)
  console.log(`Colores de tapa (prod) : ${totalColoresProd}`)
  console.log(`Colores de tapa (jueg) : ${totalColoresJue}`)
  console.log(`Componentes resueltos  : ${totalComponentes}`)
  console.log(`Filas PENDIENTE saltadas: ${saltadosPendiente.length}`)

  console.log('\n--- Productos por categoria ---')
  Object.entries(porCategoriaP)
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`  ${c.padEnd(18)} ${n}`))
  console.log('--- Juegos por categoria ---')
  Object.entries(porCategoriaJ)
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`  ${c.padEnd(18)} ${n}`))

  console.log(`\n--- Juegos y componentes (${juegosCompletos.length}/${juegos.length} completos) ---`)
  for (const j of juegos) {
    const total = j.resueltos.length + j.noResueltos.length
    const flag = j.noResueltos.length ? ' <-- INCOMPLETO' : ''
    console.log(
      `  ${(j.juego.referencia ?? 'sin ref').padEnd(8)} ${j.juego.nombre.padEnd(36)} ` +
        `piezas=${j.piezas} resueltos=${j.resueltos.length}/${total}${flag}`,
    )
    if (j.noResueltos.length) {
      console.log(`      no resueltos: ${j.noResueltos.join(', ')}`)
    }
  }

  console.log(`\n--- Filas PENDIENTE saltadas (${saltadosPendiente.length}) ---`)
  saltadosPendiente.forEach((s) => console.log(`  - ${s}`))

  console.log(`\n--- Filas sin CODIGO (referencia null) (${sinReferencia.length}) ---`)
  sinReferencia.forEach((s) => console.log(`  - ${s}`))

  console.log(`\n--- Erratas de datos del CSV (${erratas.length}) ---`)
  erratas.forEach((e) => console.log(`  ! ${e}`))

  console.log(`\n--- Anomalias de parseo (${anomalias.length}) ---`)
  anomalias.forEach((a) => console.log(`  ! ${a}`))

  const conImagen = productos.filter((p) => p.producto.imagen_url).length
  console.log(`\nProductos con imagen: ${conImagen} | Juegos con imagen: ${juegos.filter((j) => j.juego.imagen_url).length}`)
  console.log(
    `Destacados: productos [${productos.filter((p) => p.producto.destacado).map((p) => p.producto.referencia).join(', ')}] ` +
      `juegos [${juegos.filter((j) => j.juego.destacado).map((j) => j.juego.referencia).join(', ')}]`,
  )
  console.log('=================================================\n')

  if (DRY) {
    console.log('--- DRY RUN: no se escribio nada en la base de datos ---')
    return
  }

  /* --- escritura -------------------------------------------------------- */
  // categorias (upsert por slug, conservando imagen_url existente)
  const { data: catsPrev, error: eCatsPrev } = await supabase
    .from('categorias')
    .select('slug, imagen_url')
  if (eCatsPrev) throw eCatsPrev
  const imgPorSlug = Object.fromEntries((catsPrev || []).map((c) => [c.slug, c.imagen_url]))
  const { error: eCats } = await supabase.from('categorias').upsert(
    CATEGORIAS.map((c) => ({ ...c, activo: true, imagen_url: imgPorSlug[c.slug] ?? null })),
    { onConflict: 'slug' },
  )
  if (eCats) throw eCats

  const { data: cats, error: eCatsAll } = await supabase
    .from('categorias')
    .select('id, nombre, slug')
  if (eCatsAll) throw eCatsAll
  const catIdPorNombre = Object.fromEntries(cats.map((c) => [c.nombre, c.id]))

  // limpieza previa (idempotencia: se puede recargar el catalogo entero)
  for (const t of ['juego_productos', 'juego_colores', 'juegos', 'producto_colores', 'productos']) {
    const { error } = await supabase.from(t).delete().not('id', 'is', null)
    if (error) throw error
  }
  console.log('Catalogo previo eliminado (productos, juegos y tablas hijas).')

  // productos
  const prodRows = productos.map((it) => ({
    ...it.producto,
    categoria_id: catIdPorNombre[it.categoria] ?? null,
  }))
  const prodIns = []
  for (const batch of chunk(prodRows, 50)) {
    const { data, error } = await supabase
      .from('productos')
      .insert(batch)
      .select('id, orden, referencia, nombre')
    if (error) throw error
    prodIns.push(...data)
  }
  const prodIdPorOrden = new Map(prodIns.map((p) => [p.orden, p.id]))
  const prodIdPorNombre = new Map(prodIns.map((p) => [p.nombre, p.id]))
  console.log(`Productos insertados: ${prodIns.length}`)

  // colores de producto
  const colorProdRows = []
  for (const it of productos) {
    const pid = prodIdPorOrden.get(it.producto.orden)
    if (!pid) {
      anomalias.push(`No se obtuvo id para el producto "${it.producto.nombre}"`)
      continue
    }
    for (const c of it.colores) colorProdRows.push({ producto_id: pid, ...c })
  }
  let nColoresProd = 0
  for (const batch of chunk(colorProdRows, 100)) {
    const { data, error } = await supabase.from('producto_colores').insert(batch).select('id')
    if (error) throw error
    nColoresProd += data.length
  }
  console.log(`Colores de producto insertados: ${nColoresProd}`)

  // juegos
  const juegoRows = juegos.map((it) => ({
    ...it.juego,
    categoria_id: catIdPorNombre[it.categoria] ?? null,
  }))
  const juegoIns = []
  for (const batch of chunk(juegoRows, 50)) {
    const { data, error } = await supabase
      .from('juegos')
      .insert(batch)
      .select('id, orden, referencia, nombre')
    if (error) throw error
    juegoIns.push(...data)
  }
  const juegoIdPorOrden = new Map(juegoIns.map((j) => [j.orden, j.id]))
  console.log(`Juegos insertados: ${juegoIns.length}`)

  // colores y componentes de juego
  const colorJuegoRows = []
  const compRows = []
  for (const it of juegos) {
    const jid = juegoIdPorOrden.get(it.juego.orden)
    if (!jid) {
      anomalias.push(`No se obtuvo id para el juego "${it.juego.nombre}"`)
      continue
    }
    for (const c of it.colores) colorJuegoRows.push({ juego_id: jid, ...c })
    for (const c of it.resueltos) {
      const pid = prodIdPorNombre.get(c.nombreProducto)
      if (!pid) {
        anomalias.push(`Componente "${c.nombreProducto}" sin id (juego ${it.juego.nombre})`)
        continue
      }
      compRows.push({ juego_id: jid, producto_id: pid, cantidad: 1, orden: c.orden })
    }
  }
  let nColoresJuego = 0
  for (const batch of chunk(colorJuegoRows, 100)) {
    const { data, error } = await supabase.from('juego_colores').insert(batch).select('id')
    if (error) throw error
    nColoresJuego += data.length
  }
  let nComponentes = 0
  for (const batch of chunk(compRows, 100)) {
    const { data, error } = await supabase.from('juego_productos').insert(batch).select('id')
    if (error) throw error
    nComponentes += data.length
  }

  console.log('\n=============== REPORTE DE CARGA ===============')
  console.log(`Categorias        : ${cats.length}`)
  console.log(`Productos         : ${prodIns.length}`)
  console.log(`Colores producto  : ${nColoresProd}`)
  console.log(`Juegos            : ${juegoIns.length}`)
  console.log(`Colores juego     : ${nColoresJuego}`)
  console.log(`Componentes juego : ${nComponentes}`)
  console.log(`Juegos incompletos: ${juegosIncompletos.length}`)
  juegosIncompletos.forEach((j) =>
    console.log(`  ! ${j.juego.referencia ?? 'sin ref'} ${j.juego.nombre}: faltan ${j.noResueltos.join(', ')}`),
  )
  console.log(`Anomalias totales : ${anomalias.length}`)
  console.log('================================================')
}

main().catch((e) => {
  console.error('ERROR:', e.message || e)
  console.error(e)
  process.exit(1)
})
