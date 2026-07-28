// Aplica scripts/schema-gocas.sql sobre la base de datos de Supabase via conexion directa.
// Uso: node --env-file=.env.local scripts/apply-schema.mjs [ruta-sql]
//
// Requiere SUPABASE_DB_URL en el entorno (URI del session pooler de Supabase:
// Dashboard -> Project Settings -> Database -> Connection string -> Session pooler).
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SQL_PATH = process.argv[2] || path.join(__dirname, 'schema-gocas.sql')

const DB_URL = process.env.SUPABASE_DB_URL
if (!DB_URL) {
  console.error(
    'ERROR: falta SUPABASE_DB_URL en el entorno.\n' +
      '  Agregala a web/.env.local con la URI del "Session pooler" de Supabase\n' +
      '  (Dashboard -> Project Settings -> Database -> Connection string).\n' +
      '  Luego corre: node --env-file=.env.local scripts/apply-schema.mjs',
  )
  process.exit(1)
}

let sql
try {
  sql = readFileSync(SQL_PATH, 'utf8')
} catch (e) {
  console.error(`ERROR: no se pudo leer el SQL en ${SQL_PATH}: ${e.message}`)
  process.exit(1)
}

// Host sin credenciales, para logs seguros.
let hostInfo = '(host desconocido)'
try {
  const u = new URL(DB_URL)
  hostInfo = `${u.hostname}:${u.port || 5432}${u.pathname}`
} catch {
  /* ignore */
}

const client = new pg.Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
  application_name: 'aluminios-a4-apply-schema',
})

console.log(`Conectando a ${hostInfo} ...`)
try {
  await client.connect()
} catch (e) {
  console.error(`ERROR de conexion: ${e.message}`)
  process.exit(1)
}

console.log(`Ejecutando ${path.basename(SQL_PATH)} (${sql.length} bytes) ...`)
try {
  await client.query(sql)
  console.log('OK: esquema aplicado sin errores.')
} catch (e) {
  console.error('\nERROR ejecutando el SQL:')
  console.error(`  mensaje : ${e.message}`)
  if (e.detail) console.error(`  detalle : ${e.detail}`)
  if (e.hint) console.error(`  hint    : ${e.hint}`)
  if (e.position) {
    const pos = Number(e.position)
    const antes = sql.slice(Math.max(0, pos - 300), pos)
    const despues = sql.slice(pos, pos + 200)
    const linea = sql.slice(0, pos).split('\n').length
    console.error(`  linea   : ~${linea} (posicion ${pos})`)
    console.error('  contexto:\n---\n' + antes + '<<<AQUI>>>' + despues + '\n---')
  }
  await client.end()
  process.exit(1)
}

/* ------------------------------------------------------- verificacion ---- */
const TABLAS = [
  'categorias',
  'productos',
  'producto_colores',
  'juegos',
  'juego_colores',
  'juego_productos',
  'usuarios',
]

const { rows: tablas } = await client.query(
  `select c.relname as tabla,
          c.relrowsecurity as rls,
          (select count(*) from pg_policies p
             where p.schemaname = 'public' and p.tablename = c.relname) as policies
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relname = any($1)
    order by 1`,
  [TABLAS],
)

console.log('\n--- Tablas en public ---')
for (const t of tablas) {
  console.log(`  ${String(t.tabla).padEnd(18)} rls=${t.rls}  policies=${t.policies}`)
}
const faltantes = TABLAS.filter((t) => !tablas.some((r) => r.tabla === t))
if (faltantes.length) console.log(`  !! FALTAN: ${faltantes.join(', ')}`)

const { rows: buckets } = await client.query(
  `select id, public, file_size_limit, allowed_mime_types
     from storage.buckets where id = 'catalogo'`,
)
console.log('\n--- Bucket storage ---')
if (!buckets.length) console.log('  !! no existe el bucket "catalogo"')
else {
  const b = buckets[0]
  console.log(
    `  catalogo  public=${b.public}  limit=${b.file_size_limit}  mimes=${(b.allowed_mime_types || []).join(',')}`,
  )
}

const { rows: stPol } = await client.query(
  `select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'public_read_catalogo'`,
)
console.log(
  `  policy public_read_catalogo: ${stPol.length ? 'OK' : '!! NO ENCONTRADA'}`,
)

await client.end()
console.log(
  `\nListo. ${tablas.length}/${TABLAS.length} tablas presentes.${faltantes.length ? ' HAY FALTANTES.' : ''}`,
)
process.exit(faltantes.length ? 1 : 0)
