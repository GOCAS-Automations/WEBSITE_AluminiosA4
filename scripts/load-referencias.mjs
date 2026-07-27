// Carga el catalogo real de referencias de Aluminios A4 desde el CSV a Supabase.
// Uso: node --env-file=.env.local scripts/load-referencias.mjs
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  'insumos',
  'referencias_aluminiosA4.csv',
)
const STORAGE_BASE =
  'https://hqsgmmpwfhesiqnnogib.supabase.co/storage/v1/object/public/catalogo'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://hqsgmmpwfhesiqnnogib.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_KEY) {
  console.error('Falta SUPABASE_SERVICE_ROLE_KEY en el entorno (.env.local)')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const anomalias = []

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

function normalizarEmpaque(raw) {
  const s = clean(raw)
  if (!s) return null
  const tieneJuego = /juego/i.test(s)
  const iniX = s.match(/^X\s*(\d+)/i)
  if (tieneJuego && iniX) return `Caja x ${parseInt(iniX[1], 10)} o Juego`
  if (tieneJuego) return 'Unidad o Juego'
  const soloX = s.match(/^X\s*(\d+)$/i)
  if (soloX) {
    const n = parseInt(soloX[1], 10)
    return n === 1 ? 'Unidad' : `Caja x ${n}`
  }
  return s
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
      // avanzar hasta el siguiente color conocido o consumir el resto
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
    for (const c of separarColores(t)) {
      if (!out.includes(c)) out.push(c)
    }
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
      'Ollas en aluminio de alta calidad: manija, asa, premium, ovaladas y más.',
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

/* ------------------------------------------------- imagenes especiales ---- */
const IMAGENES = {
  'A4-171': { Rojo: '/productos/olla-manija-14-rojo.png', Azul: '/productos/olla-manija-14-azul.png' },
  'A4-172': { Rojo: '/productos/olla-manija-16-rojo.png', Azul: '/productos/olla-manija-16-azul.png' },
  'A4-379': { Rojo: '/productos/olla-premium-18-rojo.png', Azul: '/productos/olla-premium-18-azul.png' },
  'A4-380': { Rojo: '/productos/olla-premium-20-rojo.png', Azul: '/productos/olla-premium-20-azul.png' },
  'A4-155': { Rojo: '/productos/caldero-24-rojo.png', Azul: '/productos/caldero-24-azul.png' },
}
const DESTACADOS = new Set(['A4-171', 'A4-379', 'A4-155', 'A4-189'])

/* --------------------------------------------------------------- main ---- */
function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  const rows = parseCSV(readCsvText())
  const header = rows[0].map((h) => clean(h))
  const idx = (name) => header.findIndex((h) => h.toUpperCase() === name)
  const I = {
    codigo: idx('CODIGO'),
    articulo: idx('ARTICULO'),
    diametro: idx('DIAMETRO'),
    altura: idx('ALTURA'),
    empaque: idx('UNIDAD DE EMPAQUE'),
    manija: idx('COLORES DE MANIJA'),
    tapa: idx('COLORES DE TAPA'),
    precio: idx('PRECIO'),
  }
  for (const [k, v] of Object.entries(I)) {
    if (v === -1) throw new Error(`Columna no encontrada en el CSV: ${k}`)
  }

  const dataRows = rows
    .slice(1)
    .filter((r) => r.some((c) => clean(c) !== '') && clean(r[I.articulo]) !== '')

  const items = []
  const sinReferencia = []
  const sinPrecio = []
  const refsVistas = new Map()

  dataRows.forEach((r, i) => {
    const ctx = `fila CSV ${i + 2}`
    const codigo = clean(r[I.codigo]).toUpperCase()
    let referencia = null
    if (/^A4-\d+$/i.test(codigo)) referencia = codigo
    else if (codigo && !/^PENDIENTE$/i.test(codigo)) {
      anomalias.push(`CODIGO no reconocido "${codigo}" en ${ctx} -> referencia null`)
    }

    const nombre = normalizarNombre(r[I.articulo])
    if (referencia) {
      if (refsVistas.has(referencia)) {
        anomalias.push(
          `Referencia duplicada ${referencia} (${refsVistas.get(referencia)} y ${nombre})`,
        )
      } else refsVistas.set(referencia, nombre)
    } else {
      sinReferencia.push(nombre)
    }

    const precioRaw = normalizarPrecio(r[I.precio])
    const precio = precioRaw == null ? 0 : precioRaw
    const activo = precioRaw != null
    if (!activo) sinPrecio.push(`${nombre}${referencia ? ` (${referencia})` : ' (sin ref)'}`)

    const categoria = categoriaDe(r[I.articulo], ctx)
    const tapas = coloresTapa(r[I.tapa])
    const imgs = referencia ? IMAGENES[referencia] : null

    const producto = {
      nombre,
      referencia,
      descripcion: null,
      diametro_cm: num(r[I.diametro]),
      altura_cm: num(r[I.altura]),
      capacidad: null,
      refuerzo: false,
      empaque: normalizarEmpaque(r[I.empaque]),
      colores_manija: normalizarColoresManija(r[I.manija], ctx),
      precio,
      imagen_url: imgs ? STORAGE_BASE + imgs.Rojo : null,
      destacado: referencia ? DESTACADOS.has(referencia) : false,
      activo,
      orden: (i + 1) * 10,
    }
    if (producto.diametro_cm == null && clean(r[I.diametro]))
      anomalias.push(`DIAMETRO no numerico "${clean(r[I.diametro])}" en ${ctx}`)
    if (producto.altura_cm == null && clean(r[I.altura]))
      anomalias.push(`ALTURA no numerica "${clean(r[I.altura])}" en ${ctx}`)

    items.push({
      producto,
      categoria,
      colores: tapas.map((t, k) => ({
        nombre: t.nombre,
        hex: t.hex,
        imagen_url: imgs && imgs[t.nombre] ? STORAGE_BASE + imgs[t.nombre] : null,
        orden: k,
      })),
    })
  })

  console.log(`CSV parseado: ${items.length} filas de producto`)

  if (process.argv.includes('--dry')) {
    console.log('--- DRY RUN: no se escribe en la base de datos ---')
    for (const it of items) {
      console.log(
        [
          it.producto.referencia ?? 'NULL',
          it.producto.nombre,
          it.categoria,
          it.producto.diametro_cm,
          it.producto.altura_cm,
          it.producto.empaque,
          it.producto.colores_manija,
          it.colores.map((c) => c.nombre).join('/') || '-',
          it.producto.precio,
          it.producto.activo,
        ].join(' | '),
      )
    }
    console.log(`Anomalias (${anomalias.length}):`)
    anomalias.forEach((a) => console.log(`  ! ${a}`))
    return
  }

  // --- categorias (upsert por slug, conservando imagen_url existente) ---
  const { data: catsPrev, error: eCatsPrev } = await supabase
    .from('categorias')
    .select('slug, imagen_url')
  if (eCatsPrev) throw eCatsPrev
  const imgPorSlug = Object.fromEntries(
    (catsPrev || []).map((c) => [c.slug, c.imagen_url]),
  )
  const catRows = CATEGORIAS.map((c) => ({
    ...c,
    activo: true,
    imagen_url: imgPorSlug[c.slug] ?? null,
  }))
  const { error: eCats } = await supabase
    .from('categorias')
    .upsert(catRows, { onConflict: 'slug' })
  if (eCats) throw eCats

  const slugsValidos = CATEGORIAS.map((c) => c.slug)
  const sobrantes = (catsPrev || [])
    .map((c) => c.slug)
    .filter((s) => !slugsValidos.includes(s))
  if (sobrantes.length) {
    const { error: eDelCat } = await supabase
      .from('categorias')
      .delete()
      .in('slug', sobrantes)
    if (eDelCat) throw eDelCat
    anomalias.push(`Categorias demo eliminadas: ${sobrantes.join(', ')}`)
  }

  const { data: cats, error: eCatsAll } = await supabase
    .from('categorias')
    .select('id, nombre, slug')
  if (eCatsAll) throw eCatsAll
  const catIdPorNombre = Object.fromEntries(cats.map((c) => [c.nombre, c.id]))

  // --- limpieza de datos demo ---
  for (const t of ['juego_productos', 'juego_colores', 'juegos', 'producto_colores', 'productos']) {
    const q = supabase.from(t).delete()
    const { error } =
      t === 'juego_productos'
        ? await q.not('juego_id', 'is', null)
        : await q.not('id', 'is', null)
    if (error) throw error
  }
  console.log('Datos demo eliminados (juegos, producto_colores, productos)')

  // --- insertar productos ---
  const insertRows = items.map((it) => ({
    ...it.producto,
    categoria_id: catIdPorNombre[it.categoria] ?? null,
  }))
  const insertados = []
  for (const batch of chunk(insertRows, 50)) {
    const { data, error } = await supabase
      .from('productos')
      .insert(batch)
      .select('id, orden, referencia, nombre')
    if (error) throw error
    insertados.push(...data)
  }
  const idPorOrden = new Map(insertados.map((p) => [p.orden, p.id]))

  // --- insertar colores de tapa ---
  const colorRows = []
  for (const it of items) {
    const pid = idPorOrden.get(it.producto.orden)
    if (!pid) {
      anomalias.push(`No se obtuvo id para "${it.producto.nombre}"`)
      continue
    }
    for (const c of it.colores) colorRows.push({ producto_id: pid, ...c })
  }
  let coloresInsertados = 0
  for (const batch of chunk(colorRows, 50)) {
    const { data, error } = await supabase
      .from('producto_colores')
      .insert(batch)
      .select('id')
    if (error) throw error
    coloresInsertados += data.length
  }

  // --- reporte ---
  const porCategoria = {}
  for (const it of items) porCategoria[it.categoria] = (porCategoria[it.categoria] || 0) + 1

  console.log('\n================ REPORTE ================')
  console.log(`Productos insertados : ${insertados.length}`)
  console.log(`Colores insertados   : ${coloresInsertados}`)
  console.log(`\nFilas sin referencia (${sinReferencia.length}):`)
  sinReferencia.forEach((n) => console.log(`  - ${n}`))
  console.log(`\nFilas inactivas por precio pendiente (${sinPrecio.length}):`)
  sinPrecio.forEach((n) => console.log(`  - ${n}`))
  console.log('\nDistribucion por categoria:')
  Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`  ${c.padEnd(18)} ${n}`))
  console.log(`\nProductos con imagen asignada: ${insertRows.filter((p) => p.imagen_url).length}`)
  console.log(`Destacados: ${insertRows.filter((p) => p.destacado).map((p) => p.referencia).join(', ')}`)
  console.log(`\nAnomalias de parsing (${anomalias.length}):`)
  anomalias.forEach((a) => console.log(`  ! ${a}`))
  console.log('=========================================')
}

main().catch((e) => {
  console.error('ERROR:', e.message || e)
  console.error(e)
  process.exit(1)
})
