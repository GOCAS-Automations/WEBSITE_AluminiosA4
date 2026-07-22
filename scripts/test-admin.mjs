// Prueba la capa admin: service key válida, lectura de usuarios (RLS bypass),
// verificación bcrypt de contraseñas y un ciclo de escritura (insert + delete).
// Uso: node --env-file=.env.local scripts/test-admin.mjs
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log("service key presente:", Boolean(key), "| longitud:", key?.length ?? 0);
if (!key) { console.error("FALTA SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

const db = createClient(url, key, { auth: { persistSession: false } });

const { data: users, error } = await db
  .from("usuarios")
  .select("usuario, rol, password_hash, activo")
  .order("usuario");
if (error) { console.error("ERROR leyendo usuarios:", error.message); process.exit(1); }
console.log("usuarios:", users.map((u) => `${u.usuario}(${u.rol})`).join(", "));

const admin = users.find((u) => u.usuario === "admin");
const coord = users.find((u) => u.usuario === "coordinador");
console.log("login admin/admin123     =>", admin ? bcrypt.compareSync("admin123", admin.password_hash) : "sin admin");
console.log("login coordinador/coord123 =>", coord ? bcrypt.compareSync("coord123", coord.password_hash) : "sin coord");

// Ciclo de escritura (probando permisos de service role)
const slug = "prueba-borrar-" + Math.floor(Math.random() * 1e6);
const { data: ins, error: ie } = await db
  .from("categorias")
  .insert({ nombre: "PRUEBA (borrar)", slug, orden: 999, activo: false })
  .select("id")
  .single();
if (ie) { console.error("ERROR escribiendo:", ie.message); process.exit(1); }
const { error: de } = await db.from("categorias").delete().eq("id", ins.id);
console.log("escritura insert+delete  =>", de ? "FALLÓ: " + de.message : "OK");
console.log("\n✅ CAPA ADMIN OK");
