# CLAUDE.md — Aluminios A4

Guía de orientación para sesiones de Claude Code en este repositorio. Léela antes de tocar código.

## Qué es este proyecto

Sitio web + catálogo público + panel de administración para **Aluminios A4**, fabricante de ollas,
calderos y utensilios de aluminio en Cali, Colombia.

- **Sitio público**: landing de marca (**sin precios** en la sección de destacados — decisión del
  cliente; el catálogo y las fichas sí muestran precio), catálogo por **categorías** →
  **productos individuales** o **juegos de ollas** (pestañas), con **filtros** (búsqueda por
  nombre/referencia, precio, diámetro, color de tapa) y **orden siempre de menor a mayor precio**
  (catálogo web y PDF), tarjetas con cambio de color de tapa, medidas/empaque/precio (+ precio de
  empaque) y QR de pedido, botón de **WhatsApp** por referencia y flotante global, botón
  **"Descargar catálogo PDF"** por categoría (generado en vivo), sección de ubicación con mapa.
- **Panel admin** (`/admin`): login propio (usuario + contraseña), CRUD de productos, juegos,
  categorías y usuarios con **filtros en las listas** (búsqueda, categoría, estado visible/oculto,
  también ordenadas de menor a mayor precio), subida de imágenes a Supabase Storage o por URL
  externa (Cloudinary compatible), sección **Sitio web** (`/admin/configuracion`, administrador y
  coordinador) para editar contacto, dirección, portada del inicio y mostrar/ocultar secciones de
  la home, con reflejo inmediato en el sitio público, y sección **Pines de catálogo**
  (`/admin/pines`, administrador y coordinador) para administrar el acceso por PIN al catálogo
  (ver `## Acceso al catálogo por PIN` más abajo). Roles `administrador` (acceso total) y
  `coordinador` (catálogo, Sitio web y Pines de catálogo, sin gestión de usuarios).
- El **catálogo** (`/catalogo*`) muestra precios de mayorista y no es público: queda protegido por
  un PIN compartido (lightbox), no por cuentas de usuario — ver `## Acceso al catálogo por PIN`.

Catálogo real cargado: **124 productos individuales + 19 juegos**, en 6 categorías (Pailas 36,
Ollas 23, Calderos 22, Complementos 15, Jarras y Jarros 14, Chocolateras 14; juegos: Ollas 9,
Calderos 7, Pailas 3). Ver `docs/NOTAS_IMPORTANTES.html` para inconsistencias del Excel de origen
(artículos excluidos, referencias sin QR, QRs sin referencia, erratas de medidas, etc.).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Storage).

Proyecto Supabase: id `bapzisncyjsxaugdsmxl` (cuenta **GOCAS**). Bucket público de imágenes:
`catalogo`.

## Mapa de estructura (`src/`)

```
src/app/
  (site)/                     # grupo de rutas del sitio público
    page.tsx                  # home (destacados SIN precio — showPrice={false})
    catalogo/page.tsx         # listado de categorías
    catalogo/[slug]/page.tsx  # productos + juegos de una categoría, tabs individuales/juegos,
                               # botón "Descargar catálogo PDF"
    catalogo/producto/[id]/page.tsx
    catalogo/juego/[id]/page.tsx
    layout.tsx                # Header + Footer + WhatsAppFloat del sitio
  acceso-catalogo/
    page.tsx, PinGate.tsx      # destino del rewrite del middleware cuando falta el PIN del catálogo;
                               # lightbox con el input de PIN + botón "Solicitar un PIN" (WhatsApp)
  admin/
    login/page.tsx
    actions.ts                # server action login()/logout()
    layout.tsx                # valida sesión vía middleware, no vía este layout
    (panel)/                  # rutas protegidas: dashboard, productos, juegos, categorías, usuarios,
                               # configuracion, pines
      productos/ juegos/ categorias/ usuarios/   # cada una: page.tsx (lista con filtros), nuevo/, [id]/, actions.ts, *Form.tsx
      configuracion/          # "Sitio web": editar contacto, dirección, portada del inicio y
                               # mostrar/ocultar secciones de la home (admin y coordinador)
      pines/                  # "Pines de catálogo": CRUD de catalogo_pines (admin y coordinador);
                               # page.tsx (lista), nuevo/, [id]/, actions.ts, PinForm.tsx
  api/
    upload/route.ts               # sube archivo a Supabase Storage (requiere sesión, límite 10 MB)
    catalogo/[slug]/pdf/route.tsx # genera EN VIVO el PDF de catálogo de una categoría (@react-pdf/renderer)
    catalogo/acceso/route.ts      # POST: canjea un PIN por la cookie a4_catalogo (única ruta de
                                   # /api/catalogo/* que el middleware NUNCA bloquea)
  middleware.ts                # protege /admin (redirige a /admin/login) y restringe /admin/usuarios
                               # a administrador; protege /catalogo* + /api/catalogo/* (rewrite a
                               # /acceso-catalogo si no hay PIN válido ni sesión de panel — ver
                               # "Acceso al catálogo por PIN")

src/components/
  Logo.tsx
  site/          Header.tsx, Footer.tsx, WhatsAppFloat.tsx (botón flotante global)
  catalog/       ProductCard.tsx, SetCard.tsx, ImageBox.tsx (placeholder), ColorViewer.tsx
  admin/         AdminShell.tsx, FormBits.tsx, SubmitButton.tsx, ImageField.tsx,
                 ColoresEditor.tsx (colores de tapa por producto/juego),
                 ComponentesEditor.tsx (composición de un juego a partir de productos),
                 FiltrosBar.tsx (barra de filtros: búsqueda, categoría, estado),
                 TablaProductos.tsx / TablaJuegos.tsx (listas filtrables de Productos/Juegos)

src/lib/
  supabase.ts    # supabasePublic (anon, RLS) y supabaseAdmin() (service role, solo servidor)
  data.ts        # lecturas públicas del catálogo (usa supabasePublic)
  config.ts      # SiteConfig: lee la tabla `configuracion` (contacto, dirección, portada del
                 # inicio, mostrar/ocultar secciones); getConfig() cacheado por request, con
                 # defaults si la fila no existe. Editable desde /admin/configuracion
  admin/data.ts  # lecturas para el panel (usa supabaseAdmin)
  admin/form.ts  # helpers de parseo de FormData (strOrNull, toNum, boolFrom, parseJsonArray)
  auth.ts        # getSession/requireSession/requireAdmin, hash/verify de contraseñas (bcryptjs)
  session.ts     # firma/verifica el JWT de sesión del panel (jose, HS256, cookie a4_session)
  catalogo-acceso.ts # firma/verifica el JWT de acceso al catálogo (jose, HS256, cookie a4_catalogo,
                     # 30 días) — usado por el middleware y por /api/catalogo/acceso
  upload-client.ts # uploadImage() del lado del cliente hacia /api/upload
  whatsapp.ts    # WHATSAPP_PHONE, waLink(mensaje), WA_MSG_GENERAL — usado por WhatsAppFloat,
                 # ProductCard/SetCard y las fichas de producto/juego
  pdf/CatalogoPDF.tsx # documento @react-pdf/renderer del catálogo por categoría (usado por la route de arriba)
  types.ts       # tipos de dominio (Categoria, Producto, Juego, Usuario, etc.)
  format.ts      # formatCOP, cm, slugify, cn

scripts/  (correr con: node --env-file=.env.local scripts/<nombre>.mjs, desde web/)
  apply-schema.mjs     # aplica scripts/schema-gocas.sql sobre Supabase vía SUPABASE_DB_URL (migraciones)
  seed-usuarios.mjs    # crea/actualiza admin/coordinador con contraseñas de desarrollo
  actualizar-passwords.mjs <passAdmin> <passCoord>  # fija contraseñas DEFINITIVAS: recibe las
                        # contraseñas por argumento (nunca hardcodeadas), guarda su hash bcrypt en
                        # `usuarios.password_hash` y verifica releyendo + bcrypt.compareSync
  load-referencias.mjs # carga el catálogo real (CSV v2); soporta --dry
  upload-seed.mjs [carpeta]  # sube imágenes de una carpeta local al bucket "catalogo"
  assign-qrs.mjs       # asigna a cada producto/juego su QR ya subido, según `referencia`
  test-admin.mjs       # smoke test de la capa admin (service key, login, insert+delete)
  test-pdf.mts         # smoke test del PDF con datos mock (correr con `npx tsx scripts/test-pdf.mts`)

docs/
  MANUAL_SITIO_WEB.html      # manual de uso (sitio público + panel) — HTML brandeado, para
                              # convertir a PDF y entregar al cliente
  NOTAS_IMPORTANTES.html      # inconsistencias/notas de la carga real del catálogo — HTML
                              # brandeado, para convertir a PDF y entregar al cliente
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
node --env-file=.env.local scripts/apply-schema.mjs
node --env-file=.env.local scripts/seed-usuarios.mjs
node --env-file=.env.local scripts/actualizar-passwords.mjs <passAdmin> <passCoord>
node --env-file=.env.local scripts/load-referencias.mjs --dry
node --env-file=.env.local scripts/test-admin.mjs
node scripts/upload-seed.mjs [carpeta-origen]
node --env-file=.env.local scripts/assign-qrs.mjs [carpeta-qr]
npx tsx scripts/test-pdf.mts
```

Convención general para scripts ad-hoc de datos (carga/migración/asignación de QR, etc.):
`node --env-file=.env.local scripts/<nombre>.mjs`.

## Modelo de datos (resumen)

Tablas en Postgres (Supabase):

- **categorias** — nombre, slug, descripción, imagen, orden, activo. Categorías reales: Ollas,
  Calderos, Pailas, Jarras y Jarros, Chocolateras, Complementos.
- **productos** — ficha de un producto individual: referencia, medidas (`diametro_cm`,
  `altura_cm`), `capacidad`, **`colores_manija`** (texto, colores disponibles de la manija),
  `refuerzo` (bool), `empaque`, `precio` (por unidad), **`precio_empaque`** (precio del empaque/caja
  completo, opcional — se muestra en tarjeta/ficha/PDF solo si difiere de `precio`), `imagen_url`,
  `qr_url`, `destacado`, `activo`, `orden`.
- **producto_colores** — colores de **tapa** de un producto, cada uno con nombre, `hex` e
  `imagen_url` opcional (la foto puede cambiar según el color de tapa elegido).
- **juegos** — igual que productos pero para un juego/set de ollas (sin `colores_manija`,
  sin medidas propias: las heredan sus componentes).
- **juego_colores** — colores de tapa de un juego (mismo patrón que `producto_colores`).
- **juego_productos** — composición de un juego: FK a `productos` + `cantidad` + `orden`
  (un juego se arma seleccionando productos individuales existentes).
- **usuarios** — login propio: `usuario`, `password_hash` (bcrypt), `nombre`, `email`, `rol`
  (`administrador` | `coordinador`), `activo`, `last_login`.
- **configuracion** — fila única (contenido editable del sitio público): contacto
  (`telefono_contacto`, `whatsapp_numero`, `whatsapp_mensaje`, `email_contacto`), dirección
  (`direccion_linea1/2`, `maps_query`), portada del inicio (`hero_titulo`, `hero_subtitulo`,
  `hero_imagen_url`) y los interruptores `mostrar_franja_confianza` / `mostrar_destacados` /
  `mostrar_nosotros` / `mostrar_ubicacion`. Lectura pública (anon) vía `src/lib/config.ts`;
  escritura solo desde `/admin/configuracion` (administrador y coordinador).
- **catalogo_pines** — PINes de acceso al catálogo (precios de mayorista, no es público): `id`,
  `pin` (texto, único), `etiqueta`, `notas`, `activo` (bool), `expira_at` (timestamptz opcional),
  `usos` (contador), `ultimo_acceso` (timestamptz), `created_at`/`updated_at`. **RLS habilitado sin
  políticas**: solo accesible con `supabaseAdmin()` (service role); nunca se expone al navegador.
  Administrado desde `/admin/pines` (administrador y coordinador). Ver `## Acceso al catálogo por
  PIN` para el detalle completo del flujo.

Los datos reales (**124 productos + 19 juegos**, CSV v2) se cargaron desde
`insumos/REFERENCIAS ARTICULOS EXCEL ACTUALIZADO v2.csv` (carpeta hermana de `web/`, fuera del
repo del sitio) mediante `scripts/load-referencias.mjs`; los QR por referencia se extrajeron de
`insumos/QRs A4.pdf` y se subieron al bucket `catalogo`, carpeta `qr/`, con
`scripts/assign-qrs.mjs`. Ver `docs/NOTAS_IMPORTANTES.html` para el detalle completo de
inconsistencias detectadas al cargar (artículos sin código, referencias sin QR, QRs sin
referencia todavía, posibles erratas de medidas, etc.) — es el documento de referencia para no
repetir ese análisis. Estos dos scripts se pueden volver a correr si llega una nueva versión del
Excel (por ejemplo, `load-referencias.mjs` vincula automáticamente productos y juegos por
`referencia`, así que si vuelven filas retiradas —como las Ollas Premium individuales— quedan
enlazadas solas).

**Nota interna**: los archivos `caldero-24-*.png` del bucket `catalogo` contienen en realidad la
foto de la **Olla Especial Aro #14** (A4-155) — el nombre del archivo es histórico (de una carga
de muestra anterior); la asignación en la base de datos es correcta, no es un bug.

## Autenticación y roles

- Login propio (no Supabase Auth): server action `login()` en `src/app/admin/actions.ts` valida
  usuario+contraseña contra la tabla `usuarios` (bcrypt vía `src/lib/auth.ts`) y firma una cookie
  JWT (`a4_session`, HS256, 7 días) con `jose` usando `SESSION_SECRET` (`src/lib/session.ts`).
- `src/middleware.ts` protege todo `/admin/*`: sin sesión redirige a `/admin/login`; si el rol no
  es `administrador`, bloquea `/admin/usuarios`. El mismo middleware protege también `/catalogo*` y
  `/api/catalogo/*` con un mecanismo independiente (PIN, no sesión) — ver `## Acceso al catálogo
  por PIN`.
- `requireSession()` / `requireAdmin()` (`src/lib/auth.ts`) se usan dentro de server actions y
  páginas del panel para reforzar la misma regla del lado del servidor.
- Cliente `supabaseAdmin()` (service role) bypassa RLS y solo debe usarse en código de servidor
  (server actions, route handlers, scripts); `supabasePublic` (anon) es de solo lectura para el
  catálogo público.

## Acceso al catálogo por PIN

El catálogo (`/catalogo*`) muestra precios de mayorista y no es público: queda protegido por un PIN
compartido (no por una cuenta de usuario). Piezas involucradas:

- **Tabla `catalogo_pines`** (ver Modelo de datos): `pin`, `etiqueta`, `notas`, `activo`,
  `expira_at`, `usos`, `ultimo_acceso`. RLS **sin políticas** — solo accesible vía `supabaseAdmin()`.
- **Cookie `a4_catalogo`** (`src/lib/catalogo-acceso.ts`): JWT firmado con `jose` (HS256) usando
  `SESSION_SECRET` (mismo secreto que la cookie de sesión del panel, pero cookie independiente),
  con **30 días** de vigencia (`CATALOGO_MAX_AGE`). El `sub` del token es el `id` del PIN canjeado;
  el token no lleva el PIN en claro.
- **`src/middleware.ts`**: para `pathname === "/catalogo"`, `/catalogo/*` o `/api/catalogo/*`,
  exige sesión de panel válida **o** cookie `a4_catalogo` válida. Si falta, hace **rewrite** (no
  redirect) a `/acceso-catalogo?next=<ruta original>` en rutas de página — la URL visible no
  cambia y la página protegida nunca llega a renderizarse en el cliente — o responde `401 JSON` si
  la ruta es de `/api/catalogo/*`. La excepción explícita es `POST /api/catalogo/acceso`: nunca se
  bloquea, porque es el propio endpoint que canjea el PIN (si se bloqueara, nadie podría entrar).
  `/acceso-catalogo` queda deliberadamente fuera del `matcher` para no generar un bucle de rewrites.
- **`POST /api/catalogo/acceso`** (`src/app/api/catalogo/acceso/route.ts`): recibe `{ pin }`, trae
  de Supabase los PINes con `activo = true` y compara el PIN recibido contra cada uno **en
  JavaScript** (`.trim().toLowerCase() ===`), descartando además los que ya expiraron
  (`expira_at` en el pasado). Si hay match, firma y setea la cookie `a4_catalogo` y actualiza
  `usos`/`ultimo_acceso`; si no, responde 401 genérico tras un retardo fijo de ~500 ms (freno anti
  fuerza bruta). **Nota técnica importante**: la comparación es exacta y en servidor — nunca usar
  `.ilike()` de Supabase/PostgREST aquí. PostgREST traduce `*` a `%` y en SQL `LIKE`/`ILIKE` tanto
  `%` como `_` son comodines; si el PIN contiene `_` o `*` (como ocurre con el PIN inicial de
  entrega), un `.ilike()` haría match con PINes que no son ese, abriendo un bypass.
- **`/admin/pines`** (administrador y coordinador): CRUD de `catalogo_pines` desde el panel —
  crear (con botón que genera un PIN aleatorio fácil de dictar), editar, eliminar, y ver estado/uso
  de cada uno. La UI advierte si no queda ningún PIN activo.
- La **sesión del panel exime del PIN**: si `verifySession()` resuelve una sesión válida, el
  middleware deja pasar sin comprobar `a4_catalogo`.

**Importante para cambios futuros**: cualquier ruta nueva que exponga precios o datos del catálogo
(otra vista, otro endpoint) debe agregarse al `matcher` de `src/middleware.ts`; si no, queda
pública sin PIN.

## Política de imágenes y placeholder

Si un producto o juego no tiene `imagen_url` (o la imagen falla al cargar), el sitio **siempre**
muestra un placeholder con el logo de la empresa en vez de un hueco vacío o imagen rota —
componente `src/components/catalog/ImageBox.tsx` (fallback con `Logo` + texto "Imagen
próximamente"). Las fotos reales las sube el administrador después, desde el panel, a Supabase
Storage o pegando una URL externa (Cloudinary u otro host).

## Significado del QR

Cada producto/juego puede tener un `qr_url` (imagen del código QR). Se comunica en el sitio así:
escaneándolo **con POSGOLD**, el cliente/vendedor **realiza el pedido de esa referencia en el
sistema de Aluminios A4** — no es un enlace a la ficha del producto ni a una tienda externa. Ver
el texto exacto en `src/app/(site)/catalogo/producto/[id]/page.tsx` y `ProductCard.tsx`.

## WhatsApp

`src/lib/whatsapp.ts` centraliza el número (`WHATSAPP_PHONE = "573508228479"`) y el helper
`waLink(mensaje)` que arma el enlace `wa.me` con el mensaje codificado. Se usa en:
`WhatsAppFloat.tsx` (botón flotante global, mensaje `WA_MSG_GENERAL`), `ProductCard.tsx` /
`SetCard.tsx` (botón por tarjeta) y las fichas de producto/juego (botón de ancho completo), cada
uno armando un mensaje que incluye la referencia y el nombre. Para cambiar el número, editar solo
`WHATSAPP_PHONE` en ese archivo.

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
| `SUPABASE_DB_URL` | **Secreta.** Solo usada por `scripts/apply-schema.mjs` (conexión directa/session pooler de Postgres para migraciones de esquema). La app en runtime **no** la lee — no hace falta en Vercel. |

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
