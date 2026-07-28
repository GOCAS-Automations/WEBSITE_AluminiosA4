// Asigna a cada producto y juego su QR del bucket "catalogo" segun la columna `referencia`.
// Los QR se extrajeron de "insumos/QRs A4.pdf" y se subieron como qr/<REFERENCIA>.png.
//
// Uso: node --env-file=.env.local scripts/assign-qrs.mjs [carpeta-con-los-png]
// Por defecto lee la carpeta local de QRs del scratchpad (qr_upload/qr).
import { createClient } from '@supabase/supabase-js'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error(
    'ERROR: faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.\n' +
      '  Corre con: node --env-file=.env.local scripts/assign-qrs.mjs [carpeta-qr]',
  )
  process.exit(1)
}

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'catalogo'
const QR_DIR =
  process.argv[2] ||
  String.raw`C:\Users\cesar\AppData\Local\Temp\claude\c--Users-cesar-OneDrive-Escritorio-FREELANCE-Aluminios-A4\32ec8822-79c9-4e63-abd4-e825ba491f46\scratchpad\qr_upload\qr`

const BASE = `${URL.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}/qr/`

/* --- codigos disponibles: nombres de archivo .png de la carpeta local ----- */
let archivos
try {
  archivos = await readdir(QR_DIR)
} catch (e) {
  console.error(`ERROR: no se pudo leer la carpeta de QRs "${QR_DIR}": ${e.message}`)
  process.exit(1)
}
const codes = new Set(
  archivos
    .filter((f) => path.extname(f).toLowerCase() === '.png')
    .map((f) => path.basename(f, path.extname(f)).trim().toUpperCase()),
)

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

const [{ data: productos, error: eP }, { data: juegos, error: eJ }] = await Promise.all([
  supabase.from('productos').select('id,referencia,nombre').order('orden'),
  supabase.from('juegos').select('id,referencia,nombre').order('orden'),
])
if (eP) { console.error('Error leyendo productos:', eP.message); process.exit(1) }
if (eJ) { console.error('Error leyendo juegos:', eJ.message); process.exit(1) }

console.log(`Carpeta QR : ${QR_DIR}`)
console.log(`QRs disponibles: ${codes.size}`)
console.log(`Productos: ${productos.length}   Juegos: ${juegos.length}\n`)

const refsUsadas = new Set()
let errores = 0

async function asignar(tabla, filas) {
  const con = []
  const sin = []
  for (const f of filas) {
    const ref = f.referencia?.trim().toUpperCase()
    if (ref && codes.has(ref)) { con.push({ ...f, ref }); refsUsadas.add(ref) }
    else sin.push(f)
  }
  let ok = 0
  let limpiados = 0
  for (const f of con) {
    const { error } = await supabase
      .from(tabla)
      .update({ qr_url: BASE + encodeURIComponent(f.ref) + '.png' })
      .eq('id', f.id)
    if (error) { console.error(`ERROR set ${tabla} ${f.referencia}: ${error.message}`); errores++ }
    else ok++
  }
  for (const f of sin) {
    const { error } = await supabase.from(tabla).update({ qr_url: null }).eq('id', f.id)
    if (error) { console.error(`ERROR null ${tabla} ${f.referencia}: ${error.message}`); errores++ }
    else limpiados++
  }
  console.log(`${tabla}: ${ok} con QR asignado, ${limpiados} sin QR (qr_url = null)`)
  return { con, sin }
}

const resProd = await asignar('productos', productos)
const resJueg = await asignar('juegos', juegos)

/* ------------------------------------------------------------ reportes --- */
console.log(`\n--- PRODUCTOS SIN QR (${resProd.sin.length}) ---`)
for (const p of resProd.sin) console.log(`  ${(p.referencia ?? 'SIN CODIGO').padEnd(10)} ${p.nombre}`)

console.log(`\n--- JUEGOS SIN QR (${resJueg.sin.length}) ---`)
for (const j of resJueg.sin) console.log(`  ${(j.referencia ?? 'SIN CODIGO').padEnd(10)} ${j.nombre}`)

const huerfanos = [...codes].filter((c) => !refsUsadas.has(c)).sort()
console.log(`\n--- QRs HUERFANOS: codigo con PNG pero sin fila en la base (${huerfanos.length}) ---`)
for (const chunkStart of Array.from({ length: Math.ceil(huerfanos.length / 10) }, (_, i) => i * 10)) {
  console.log('  ' + huerfanos.slice(chunkStart, chunkStart + 10).join(', '))
}

/* --------------------------------------------------------- verificacion -- */
const [{ data: vp }, { data: vj }] = await Promise.all([
  supabase.from('productos').select('id,qr_url'),
  supabase.from('juegos').select('id,qr_url'),
])
console.log(
  `\nVERIFICACION: productos ${vp.filter((p) => p.qr_url).length}/${vp.length} con qr_url · ` +
    `juegos ${vj.filter((j) => j.qr_url).length}/${vj.length} con qr_url · errores=${errores}`,
)
if (errores) process.exit(1)
