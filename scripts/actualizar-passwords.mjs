// Actualiza las contraseñas definitivas de admin y coordinador en la tabla `usuarios`.
// Uso:
//   node --env-file=.env.local scripts/actualizar-passwords.mjs <passAdmin> <passCoord>
//
// No deja contraseñas hardcodeadas en el repo: se reciben por argumentos y solo se
// guarda su hash bcrypt en Supabase. Al final relee los hashes guardados y confirma
// con bcrypt.compareSync que las contraseñas nuevas funcionan (true/true esperado).
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const [, , passAdmin, passCoord] = process.argv;

if (!passAdmin || !passCoord) {
  console.error(
    "ERROR: faltan contraseñas.\n" +
      "  Uso: node --env-file=.env.local scripts/actualizar-passwords.mjs <passAdmin> <passCoord>",
  );
  process.exit(1);
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error(
    "ERROR: faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  Corre con: node --env-file=.env.local scripts/actualizar-passwords.mjs <passAdmin> <passCoord>",
  );
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

const ACTUALIZACIONES = [
  { usuario: "admin", nueva: passAdmin },
  { usuario: "coordinador", nueva: passCoord },
];

for (const { usuario, nueva } of ACTUALIZACIONES) {
  const hash = bcrypt.hashSync(nueva, 10);
  const { error } = await supabase
    .from("usuarios")
    .update({ password_hash: hash })
    .eq("usuario", usuario);

  if (error) {
    console.error(`ERROR al actualizar '${usuario}':`, error.message);
    process.exit(1);
  }
  console.log(`OK  password_hash actualizado para '${usuario}'`);
}

// Verificación: releer los hashes guardados y comparar con bcrypt.compareSync.
console.log("\nVerificación:");
for (const { usuario, nueva } of ACTUALIZACIONES) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("usuario, password_hash")
    .eq("usuario", usuario)
    .maybeSingle();

  if (error || !data) {
    console.error(`ERROR al releer '${usuario}':`, error?.message ?? "usuario no encontrado");
    process.exit(1);
  }

  const ok = bcrypt.compareSync(nueva, data.password_hash);
  console.log(`login ${usuario.padEnd(12)} => ${ok}`);
  if (!ok) process.exit(1);
}
