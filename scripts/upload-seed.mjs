// Sube las imágenes de demo (productos, juegos, QR) al bucket "catalogo".
// Uso: node scripts/upload-seed.mjs [carpeta-origen]
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hqsgmmpwfhesiqnnogib.supabase.co'
// Usa service role si está disponible; si no, la anon/publishable key (con política temporal).
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || 'sb_publishable_L2qOiAs0QOa-9PgdJ10Qpg_-_VMyOdF'

const SRC = process.argv[2] || String.raw`C:\Users\cesar\AppData\Local\Temp\claude\c--Users-cesar-OneDrive-Escritorio-FREELANCE-Aluminios-A4\32ec8822-79c9-4e63-abd4-e825ba491f46\scratchpad\upload`

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif' }

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

async function walk(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  let count = 0
  for (const e of entries) {
    const full = path.join(dir, e.name)
    const key = prefix ? `${prefix}/${e.name}` : e.name
    if (e.isDirectory()) {
      count += await walk(full, key)
    } else {
      const buf = await readFile(full)
      const ext = path.extname(e.name).toLowerCase()
      const { error } = await supabase.storage.from('catalogo').upload(key, buf, {
        contentType: MIME[ext] || 'application/octet-stream',
        upsert: true,
      })
      if (error) { console.error('ERROR', key, error.message) }
      else { console.log('OK  ', key); count++ }
    }
  }
  return count
}

const n = await walk(SRC)
console.log(`\nSubidas ${n} imágenes al bucket "catalogo".`)
