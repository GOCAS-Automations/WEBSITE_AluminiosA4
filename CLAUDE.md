# CLAUDE.md — Aluminios A4

Guía de orientación para sesiones de Claude Code en este repositorio. Léela antes de tocar código.

## Qué es este proyecto

Sitio web + catálogo público + panel de administración para **Aluminios A4**, fabricante de ollas,
calderos y utensilios de aluminio en Cali, Colombia.

- **Sitio público**: landing de marca, catálogo por **categorías** → **productos individuales** o
  **juegos de ollas**, tarjetas con cambio de color de tapa, medidas/empaque/precio y QR de pedido,
  sección de ubicación con mapa.
- **Panel admin** (`/admin`): login propio (usuario + contraseña), CRUD de productos, juegos,
  categorías y usuarios, subida de imágenes a Supabase Storage o por URL externa (Cloudinary
  compatible). Roles `administrador` y `coordinador`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Storage).

Proyecto Supabase: id `hqsgmmpwfhesiqnnogib`. Bucket público de imágenes: `catalogo`.

## Mapa de estructura (`src/`)

```
src/app/
  (site)/                     # grupo de rutas del sitio público
    page.tsx                  # home
    catalogo/page.tsx         # listado de categorías
    catalogo/[slug]/page.tsx  # productos + juegos de una categoría
    catalogo/producto/[id]/page.tsx
    catalogo/juego/[id]/page.tsx
    layout.tsx                # Header + Footer del sitio
  admin/
    login/page.tsx
    actions.ts                # server action login()/logout()
    layout.tsx                # valida sesión vía middleware, no vía este layout
    (panel)/                  # rutas protegidas: dashboard, productos, juegos, categorías, usuarios
      productos/ juegos/ categorias/ usuarios/   # cada una: page.tsx (lista), nuevo/, [id]/, actions.ts, *Form.tsx
  api/upload/route.ts          # sube archivo a Supabase Storage (requiere sesión)
  middleware.ts                # protege /admin, restringe /admin/usuarios a administrador

src/components/
  Logo.tsx
  site/          Header.tsx, Footer.tsx
  catalog/       ProductCard.tsx, SetCard.tsx, ImageBox.tsx (placeholder), ColorViewer.tsx
  admin/         AdminShell.tsx, FormBits.tsx, SubmitButton.tsx, ImageField.tsx,
                 ColoresEditor.tsx (colores de tapa por producto/juego),
                 ComponentesEditor.tsx (composición de un juego a partir de productos)

src/lib/
  supabase.ts    # supabasePublic (anon, RLS) y supabaseAdmin() (service role, solo servidor)
  data.ts        # lecturas públicas del catálogo (usa supabasePublic)
  admin/data.ts  # lecturas para el panel (usa supabaseAdmin)
  admin/form.ts  # helpers de parseo de FormData (strOrNull, toNum, boolFrom, parseJsonArray)
  auth.ts        # getSession/requireSession/requireAdmin, hash/verify de contraseñas (bcryptjs)
  session.ts     # firma/verifica el JWT de sesión (jose, HS256)
  upload-client.ts # uploadImage() del lado del cliente hacia /api/upload
  types.ts       # tipos de dominio (Categoria, Producto, Juego, Usuario, etc.)
  format.ts      # formatCOP, cm, slugify, cn

scripts/
  upload-seed.mjs  # sube imágenes de una carpeta local al bucket "catalogo"
  test-admin.mjs   # smoke test de la capa admin (service key, login, insert+delete)
```

No existe carpeta `src/app/(site)/admin` — la ruta admin vive en `src/app/admin`, separada del
grupo `(site)`.

## Comandos

```bash
npm run dev            # desarrollo local (http://localhost:3000)
npm run build           # build de producción
npm run start           # sirve el build
npm run lint            # eslint

# scripts puntuales (requieren variables de entorno; usar --env-file para cargarlas)
node --env-file=.env.local scripts/test-admin.mjs
node scripts/upload-seed.mjs [carpeta-origen]
```

Convención general para scripts ad-hoc de datos (carga/migración/asignación de QR, etc.):
`node --env-file=.env.local scripts/<nombre>.mjs`.

## Modelo de datos (resumen)

Tablas en Postgres (Supabase):

- **categorias** — nombre, slug, descripción, imagen, orden, activo. Categorías reales: Ollas,
  Calderos, Pailas, Jarras y Jarros, Chocolateras, Complementos.
- **productos** — ficha de un producto individual: referencia, medidas (`diametro_cm`,
  `altura_cm`), `capacidad`, **`colores_manija`** (texto, colores disponibles de la manija),
  `refuerzo` (bool), `empaque`, `precio`, `imagen_url`, `qr_url`, `destacado`, `activo`, `orden`.
- **producto_colores** — colores de **tapa** de un producto, cada uno con nombre, `hex` e
  `imagen_url` opcional (la foto puede cambiar según el color de tapa elegido).
- **juegos** — igual que productos pero para un juego/set de ollas (sin `colores_manija`,
  sin medidas propias: las heredan sus componentes).
- **juego_colores** — colores de tapa de un juego (mismo patrón que `producto_colores`).
- **juego_productos** — composición de un juego: FK a `productos` + `cantidad` + `orden`
  (un juego se arma seleccionando productos individuales existentes).
- **usuarios** — login propio: `usuario`, `password_hash` (bcrypt), `nombre`, `email`, `rol`
  (`administrador` | `coordinador`), `activo`, `last_login`.

Los datos reales (~134 referencias) se cargaron desde `insumos/referencias_aluminiosA4.csv`
(carpeta hermana de `web/`, fuera del repo del sitio) mediante un script de carga puntual
(`scripts/load-referencias.mjs`); los QR por referencia se extrajeron de `insumos/QRs A4.pdf` y
se subieron al bucket `catalogo`, carpeta `qr/`, con un script de asignación
(`scripts/assign-qrs.mjs`). Estos dos scripts fueron procesos de una sola vez sobre la base de
datos: si no están presentes en `scripts/` al leer esto, ya cumplieron su función (los datos y QR
ya están en Supabase) y solo habría que recrearlos si se necesita repetir una carga masiva.

## Autenticación y roles

- Login propio (no Supabase Auth): server action `login()` en `src/app/admin/actions.ts` valida
  usuario+contraseña contra la tabla `usuarios` (bcrypt vía `src/lib/auth.ts`) y firma una cookie
  JWT (`a4_session`, HS256, 7 días) con `jose` usando `SESSION_SECRET` (`src/lib/session.ts`).
- `src/middleware.ts` protege todo `/admin/*`: sin sesión redirige a `/admin/login`; si el rol no
  es `administrador`, bloquea `/admin/usuarios`.
- `requireSession()` / `requireAdmin()` (`src/lib/auth.ts`) se usan dentro de server actions y
  páginas del panel para reforzar la misma regla del lado del servidor.
- Cliente `supabaseAdmin()` (service role) bypassa RLS y solo debe usarse en código de servidor
  (server actions, route handlers, scripts); `supabasePublic` (anon) es de solo lectura para el
  catálogo público.

## Política de imágenes y placeholder

Si un producto o juego no tiene `imagen_url` (o la imagen falla al cargar), el sitio **siempre**
muestra un placeholder con el logo de la empresa en vez de un hueco vacío o imagen rota —
componente `src/components/catalog/ImageBox.tsx` (fallback con `Logo` + texto "Imagen
próximamente"). Las fotos reales las sube el administrador después, desde el panel, a Supabase
Storage o pegando una URL externa (Cloudinary u otro host).

## Significado del QR

Cada producto/juego puede tener un `qr_url` (imagen del código QR). Se comunica en el sitio así:
escaneándolo, el cliente/vendedor **realiza el pedido de esa referencia en el sistema interno de
Aluminios A4** — no es un enlace a la ficha del producto ni a una tienda externa. Ver el texto
exacto en `src/app/(site)/catalogo/producto/[id]/page.tsx` y `ProductCard.tsx`.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar (nunca commitear `.env.local`):

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key pública (lectura del catálogo, respeta RLS) |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | Bucket de imágenes (`catalogo`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreta.** Solo servidor: login, CRUD, subida de imágenes |
| `SESSION_SECRET` | Firma la cookie JWT de sesión |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (enlaces/QR) |

## Despliegue

Repo: `https://github.com/GOCAS-Automations/WEBSITE_AluminiosA4.git` (organización
GOCAS-Automations). Hosting: Vercel (cuenta GOCAS), auto-deploy en cada push a `main`. Las mismas
variables de entorno de `.env.local` deben estar configuradas en Vercel (Project Settings →
Environment Variables), ajustando `NEXT_PUBLIC_SITE_URL` al dominio real.

## Flujo de trabajo de agentes (Fable / Opus / Sonnet)

**Regla importante para esta cuenta**: cuando la sesión de Claude Code corre con el modelo
**Fable**, Fable actúa únicamente como **planificador, orquestador y verificador** — no ejecuta
directamente cambios de código, base de datos ni archivos. Toda la ejecución real (escribir o
modificar código, correr scripts de datos, tocar Supabase, actualizar documentación, etc.) se
**delega a subagentes** vía la herramienta Agent, usando:

- **Opus** para tareas complejas (diseño de solución, cambios que requieren juicio, refactors
  no triviales, decisiones de arquitectura o de modelo de datos).
- **Sonnet** para tareas mecánicas (cambios acotados y bien definidos, documentación, scripts
  repetitivos, aplicar un plan ya decidido).

Si estás leyendo esto como subagente Opus o Sonnet: ejecuta la tarea que te delegó Fable con este
archivo como referencia de arquitectura; si la instrucción es ambigua o contradice lo aquí
documentado, señálalo en tu reporte final en vez de asumir.
