// Asigna a cada producto su QR del bucket "catalogo" segun la columna `referencia`.
// Los QR fueron extraidos de "insumos/QRs A4.pdf" y subidos como qr/<COD>.png
// Uso: node --env-file=.env.local scripts/assign-qrs.mjs [ruta-codes.json]
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hqsgmmpwfhesiqnnogib.supabase.co'
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) { console.error('Falta SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const CODES_JSON = process.argv[2] || String.raw`C:\Users\cesar\AppData\Local\Temp\claude\c--Users-cesar-OneDrive-Escritorio-FREELANCE-Aluminios-A4\32ec8822-79c9-4e63-abd4-e825ba491f46\scratchpad\codes.json`
const BASE = `${URL}/storage/v1/object/public/catalogo/qr/`

const codes = new Set(JSON.parse(await readFile(CODES_JSON, 'utf8')))
const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

const { data: productos, error } = await supabase
  .from('productos')
  .select('id,referencia,nombre')
  .order('referencia', { ascending: true })
if (error) { console.error('Error leyendo productos:', error.message); process.exit(1) }

console.log(`Productos: ${productos.length}   |   Codigos QR disponibles: ${codes.size}`)

const conQR = [], sinQR = []
for (const p of productos) {
  const ref = p.referencia?.trim()
  if (ref && codes.has(ref)) conQR.push({ ...p, ref })
  else sinQR.push(p)
}

let okAsig = 0, okLimpio = 0, errores = 0
for (const p of conQR) {
  const { error: e } = await supabase.from('productos')
    .update({ qr_url: BASE + encodeURIComponent(p.ref) + '.png' }).eq('id', p.id)
  if (e) { console.error('ERROR set', p.referencia, e.message); errores++ } else okAsig++
}
// Limpia QRs demo previos en los productos que no tienen QR real.
for (const p of sinQR) {
  const { error: e } = await supabase.from('productos')
    .update({ qr_url: null }).eq('id', p.id)
  if (e) { console.error('ERROR null', p.referencia, e.message); errores++ } else okLimpio++
}

// Codigos del PDF que no corresponden a ningun producto.
const refsUsadas = new Set(conQR.map(p => p.ref))
const huerfanos = [...codes].filter(c => !refsUsadas.has(c)).sort()

console.log(`\nAsignados : ${okAsig}`)
console.log(`Limpiados : ${okLimpio} (qr_url = null)`)
console.log(`Errores   : ${errores}`)

console.log(`\n--- Productos SIN QR (${sinQR.length}) ---`)
for (const p of sinQR) console.log(`  ref=${p.referencia ?? 'NULL'}  ${p.nombre}`)

console.log(`\n--- Codigos QR HUERFANOS, sin producto (${huerfanos.length}) ---`)
console.log('  ' + huerfanos.join(', '))

// Verificacion final leyendo de vuelta la tabla.
const { data: fin } = await supabase.from('productos').select('id,qr_url')
console.log(`\nVERIFICACION: ${fin.filter(p => p.qr_url).length} productos con qr_url, ${fin.filter(p => !p.qr_url).length} sin qr_url (de ${fin.length}).`)
