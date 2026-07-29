# Aluminios A4 — Sitio web y catálogo

Sitio web y catálogo público + panel de administración para **Aluminios A4** (fabricantes de
ollas, calderos y utensilios en aluminio, Cali - Colombia).

Repositorio: [github.com/GOCAS-Automations/WEBSITE_AluminiosA4](https://github.com/GOCAS-Automations/WEBSITE_AluminiosA4)

- **Sitio público**: landing de marca (sin precios, por decisión del cliente), catálogo con el
  inventario real de la empresa (**124 productos individuales + 19 juegos**) organizado por
  **6 categorías** (Ollas, Calderos, Pailas, Jarras y Jarros, Chocolateras, Complementos) →
  **productos individuales** o **juegos de ollas** (con pestañas para elegir), con tarjetas de
  **cambio de color de tapa**, medidas, colores de manija, empaque + **precio por empaque**,
  precio por unidad y **código QR de pedido** por referencia, y sección de **ubicación con
  mapa**. El QR se escanea con **POSGOLD** y permite realizar el pedido de esa referencia
  directamente en el sistema de Aluminios A4.
- **Catálogo en PDF por categoría**: botón "Descargar catálogo PDF" en cada categoría
  (`/api/catalogo/[slug]/pdf`) que genera **en vivo** un PDF con los productos y juegos de esa
  categoría (fotos, medidas, precios y QR) usando los datos cargados en ese momento — no es un
  archivo fijo.
- **WhatsApp**: botón flotante global (mensaje general) en todo el sitio público, más un botón
  por referencia en cada tarjeta/ficha de producto y juego con un mensaje prellenado que incluye
  el código de referencia (`src/lib/whatsapp.ts`). Número: **350 822 8479**.
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

Copia `.env.example` a `.env.local` y complétalas (ver también la sección de despliegue). El
proyecto de Supabase corre bajo la cuenta **GOCAS** (proyecto `bapzisncyjsxaugdsmxl`), bucket
público `catalogo`.

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable/anon key (lectura pública del catálogo) |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | Bucket de imágenes (por defecto `catalogo`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreta.** Solo servidor: login, CRUD y subida de imágenes |
| `SESSION_SECRET` | Secreto para firmar la cookie de sesión |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (para QR/enlaces) |
| `SUPABASE_DB_URL` | **Secreta.** Solo para `scripts/apply-schema.mjs` (migraciones de esquema vía conexión directa/session pooler). La app en runtime **no** la usa. |

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

Todos se corren desde `web/` con `node --env-file=.env.local scripts/<script>.mjs` (cargan las
variables de entorno desde `.env.local`):

- `scripts/apply-schema.mjs` — aplica `scripts/schema-gocas.sql` sobre Supabase vía conexión
  directa (requiere `SUPABASE_DB_URL`); útil para migraciones de esquema.
- `scripts/seed-usuarios.mjs` — crea/actualiza los usuarios base del panel (`admin`, `coordinador`).
- `scripts/load-referencias.mjs` — carga el catálogo real (CSV v2: categorías, productos, colores
  de tapa, juegos y su composición). Soporta `--dry` para solo parsear y reportar sin escribir.
- `scripts/upload-seed.mjs <carpeta>` — sube imágenes de una carpeta local al bucket `catalogo`.
- `scripts/assign-qrs.mjs` — asigna a cada producto/juego su QR ya subido al bucket, según la
  columna `referencia`.
- `scripts/test-admin.mjs` — smoke test de la capa admin (service key, login, insert+delete).
- `scripts/test-pdf.mts` (correr con `npx tsx scripts/test-pdf.mts`) — smoke test del PDF de
  catálogo con datos mock, sin tocar la base de datos.

Los datos reales del catálogo (**124 productos + 19 juegos**, con su respectivo QR de pedido) ya
están cargados en Supabase; los scripts de carga/asignación existen para repetir el proceso si
hace falta una recarga masiva (por ejemplo, una nueva versión del Excel de referencias).

## Documentación para el cliente

Los siguientes documentos, en `web/docs/`, están pensados para entregar a Aluminios A4 (sin
lenguaje técnico):

- [`docs/MANUAL_SITIO_WEB.md`](./docs/MANUAL_SITIO_WEB.md) — manual de uso del sitio público y
  del panel de administración.
- [`docs/NOTAS_IMPORTANTES.md`](./docs/NOTAS_IMPORTANTES.md) — inconsistencias e información
  relevante detectadas al cargar el catálogo real (artículos excluidos, referencias sin QR, QRs
  sin referencia todavía, posibles erratas de medidas, etc.).

## Más documentación

Para arquitectura detallada, modelo de datos completo, autenticación/roles y el flujo de trabajo
de agentes de este proyecto, ver [`CLAUDE.md`](./CLAUDE.md).
