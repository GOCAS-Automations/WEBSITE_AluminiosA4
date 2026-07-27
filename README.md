# Aluminios A4 — Sitio web y catálogo

Sitio web y catálogo público + panel de administración para **Aluminios A4** (fabricantes de
ollas, calderos y utensilios en aluminio, Cali - Colombia).

Repositorio: [github.com/GOCAS-Automations/WEBSITE_AluminiosA4](https://github.com/GOCAS-Automations/WEBSITE_AluminiosA4)

- **Sitio público**: landing de marca, catálogo con el inventario real de la empresa (**~134
  referencias**) organizado por **categorías** (Ollas, Calderos, Pailas, Jarras y Jarros,
  Chocolateras, Complementos) → **productos individuales** o **juegos de ollas**, con tarjetas
  de **cambio de color de tapa**, medidas, colores de manija, empaque, precio y **código QR de
  pedido** por referencia, y sección de **ubicación con mapa**. Escanear el QR permite realizar
  el pedido de esa referencia directamente en el sistema interno de Aluminios A4.
- Si un producto o juego aún no tiene foto real cargada, el sitio muestra siempre un
  **placeholder con el logo de la empresa** en vez de un espacio vacío o imagen rota; el
  administrador sube las fotos definitivas después desde el panel.
- **Panel de administración** (`/admin`): login por usuario (contraseñas con hash bcrypt + sesión
  firmada), CRUD de **productos, juegos, categorías y usuarios**, con subida de imágenes a
  **Supabase Storage** o por **URL** (Cloudinary compatible). Roles: **administrador** y **coordinador**
  (el coordinador no tiene acceso a la gestión de usuarios).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Storage).

## Variables de entorno

Copia `.env.example` a `.env.local` y complétalas (ver también la sección de despliegue):

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable/anon key (lectura pública del catálogo) |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | Bucket de imágenes (por defecto `catalogo`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreta.** Solo servidor: login, CRUD y subida de imágenes |
| `SESSION_SECRET` | Secreto para firmar la cookie de sesión |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (para QR/enlaces) |

## Desarrollo local

```bash
npm install
npm run dev
# http://localhost:3000
```

### Cuentas de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | administrador |
| `coordinador` | `coord123` | coordinador |

> Cambia estas contraseñas desde **Admin → Usuarios** antes de producción.

## Despliegue en Vercel

1. Importa este repositorio en [vercel.com/new](https://vercel.com/new). Framework: **Next.js** (autodetectado).
2. En **Environment Variables**, agrega las mismas variables de `.env.local`
   (incluida `SUPABASE_SERVICE_ROLE_KEY`). Ajusta `NEXT_PUBLIC_SITE_URL` al dominio de Vercel.
3. **Deploy**. Cada `git push` a `main` genera un nuevo despliegue.

## Scripts útiles

- `scripts/upload-seed.mjs` — sube imágenes de ejemplo al bucket.
- `scripts/test-admin.mjs` — verifica la capa admin (`node --env-file=.env.local scripts/test-admin.mjs`).

Los datos reales del catálogo (~134 referencias, con su respectivo QR de pedido) se cargaron
en Supabase mediante scripts puntuales de carga/asignación a partir de los insumos originales
(CSV de referencias y PDF de QRs); no son necesarios para el día a día una vez la base de datos
está poblada.

## Más documentación

Para arquitectura detallada, modelo de datos completo, autenticación/roles y el flujo de trabajo
de agentes de este proyecto, ver [`CLAUDE.md`](./CLAUDE.md).
