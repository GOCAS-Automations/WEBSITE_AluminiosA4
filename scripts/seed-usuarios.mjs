// Crea (o actualiza) los usuarios base del panel admin de Aluminios A4.
// Uso: node --env-file=.env.local scripts/seed-usuarios.mjs
//
// Contrasenas iniciales: admin/admin123 y coordinador/coord123.
// CAMBIARLAS desde el panel (/admin/usuarios) despues del primer ingreso.
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error(
    'ERROR: faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.\n' +
      '  Corre con: node --env-file=.env.local scripts/seed-usuarios.mjs',
  )
  process.exit(1)
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

const USUARIOS = [
  {
    usuario: 'admin',
    nombre: 'Administrador',
    email: null,
    rol: 'administrador',
    // bcrypt de "admin123"
    password_hash: '$2b$10$jLCB2So5AVRPGeHlHiI50O2P3xdCAGRSh3sc99cYuJxEGYIuNaZ4m',
    activo: true,
  },
  {
    usuario: 'coordinador',
    nombre: 'Coordinador',
    email: null,
    rol: 'coordinador',
    // bcrypt de "coord123"
    password_hash: '$2b$10$P8LyrV2huHJaKf2Tjt0aG.XTUwxAxExkztaAzuNb.oSrmK67/DnU.',
    activo: true,
  },
]

const { data, error } = await supabase
  .from('usuarios')
  .upsert(USUARIOS, { onConflict: 'usuario' })
  .select('id, usuario, nombre, rol, activo')

if (error) {
  console.error('ERROR al insertar usuarios:', error.message)
  process.exit(1)
}

for (const u of data) {
  console.log(`OK  ${u.usuario.padEnd(12)} ${u.rol.padEnd(14)} activo=${u.activo}`)
}

const { count } = await supabase
  .from('usuarios')
  .select('*', { count: 'exact', head: true })
console.log(`\nTotal de usuarios en la tabla: ${count}`)
