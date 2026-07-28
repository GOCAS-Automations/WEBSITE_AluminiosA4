// Sube el contenido de una carpeta local al bucket "catalogo" de Supabase Storage,
// conservando la estructura de subcarpetas (productos/, juegos/, qr/).
// Uso: node --env-file=.env.local scripts/upload-seed.mjs <carpeta-origen>
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error(
    'ERROR: faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.\n' +
      '  Corre con: node --env-file=.env.local scripts/upload-seed.mjs <carpeta-origen>',
  )
  process.exit(1)
}

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'catalogo'
const SRC = process.argv[2]
if (!SRC) {
  console.error('ERROR: falta la carpeta de origen.\n  Uso: scripts/upload-seed.mjs <carpeta-origen>')
  process.exit(1)
}

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

let ok = 0
const errores = []

async function walk(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    const key = prefix ? `${prefix}/${e.name}` : e.name
    if (e.isDirectory()) {
      await walk(full, key)
      continue
    }
    const ext = path.extname(e.name).toLowerCase()
    if (!MIME[ext]) {
      errores.push(`${key}: extension no soportada (${ext})`)
      continue
    }
    const buf = await readFile(full)
    const { error } = await supabase.storage.from(BUCKET).upload(key, buf, {
      contentType: MIME[ext],
      upsert: true,
    })
    if (error) errores.push(`${key}: ${error.message}`)
    else ok++
  }
}

console.log(`Origen : ${SRC}`)
console.log(`Bucket : ${BUCKET}\n`)
await walk(SRC)

console.log(`Subidos : ${ok}`)
console.log(`Errores : ${errores.length}`)
for (const e of errores) console.log(`  ! ${e}`)
if (errores.length) process.exit(1)
