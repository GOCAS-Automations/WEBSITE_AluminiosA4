-- Aluminios A4 · Esquema completo. Pegar TODO en Supabase Dashboard → SQL Editor → Run
--
-- Proyecto destino: bapzisncyjsxaugdsmxl (cuenta GOCAS)
-- Es idempotente: se puede ejecutar varias veces sin romper nada ni borrar datos.
-- Crea: 7 tablas + trigger updated_at + RLS con lectura pública + bucket Storage "catalogo".

/* ===========================================================================
   1. Función y trigger de updated_at
   =========================================================================== */

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


/* ===========================================================================
   2. Tablas
   =========================================================================== */

-- 2.1 categorias -------------------------------------------------------------
create table if not exists public.categorias (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  slug        text not null unique,
  descripcion text,
  imagen_url  text,
  orden       integer not null default 0,
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2.2 productos --------------------------------------------------------------
create table if not exists public.productos (
  id             uuid primary key default gen_random_uuid(),
  categoria_id   uuid references public.categorias(id) on delete set null,
  nombre         text not null,
  referencia     text,
  descripcion    text,
  diametro_cm    numeric,
  altura_cm      numeric,
  capacidad      text,
  colores_manija text,
  refuerzo       boolean not null default false,
  empaque        text,
  precio         numeric not null default 0,
  precio_empaque numeric,
  imagen_url     text,
  qr_url         text,
  destacado      boolean not null default false,
  activo         boolean not null default true,
  orden          integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Por si la tabla ya existía sin estas columnas (proyecto migrado):
alter table public.productos add column if not exists colores_manija text;
alter table public.productos add column if not exists precio_empaque numeric;

create index if not exists productos_categoria_id_idx on public.productos (categoria_id);
create index if not exists productos_referencia_idx   on public.productos (referencia);
create index if not exists productos_orden_idx        on public.productos (orden);

-- 2.3 producto_colores (colores de TAPA de un producto) ----------------------
create table if not exists public.producto_colores (
  id          uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id) on delete cascade,
  nombre      text not null,
  hex         text,
  imagen_url  text,
  orden       integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists producto_colores_producto_id_idx
  on public.producto_colores (producto_id);

-- 2.4 juegos -----------------------------------------------------------------
create table if not exists public.juegos (
  id           uuid primary key default gen_random_uuid(),
  categoria_id uuid references public.categorias(id) on delete set null,
  nombre       text not null,
  referencia   text,
  descripcion  text,
  refuerzo     boolean not null default false,
  empaque      text,
  precio       numeric not null default 0,
  imagen_url   text,
  qr_url       text,
  destacado    boolean not null default false,
  activo       boolean not null default true,
  orden        integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists juegos_categoria_id_idx on public.juegos (categoria_id);
create index if not exists juegos_referencia_idx   on public.juegos (referencia);
create index if not exists juegos_orden_idx        on public.juegos (orden);

-- 2.5 juego_colores ----------------------------------------------------------
create table if not exists public.juego_colores (
  id         uuid primary key default gen_random_uuid(),
  juego_id   uuid not null references public.juegos(id) on delete cascade,
  nombre     text not null,
  hex        text,
  imagen_url text,
  orden      integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists juego_colores_juego_id_idx on public.juego_colores (juego_id);

-- 2.6 juego_productos (composición de un juego) ------------------------------
create table if not exists public.juego_productos (
  id          uuid primary key default gen_random_uuid(),
  juego_id    uuid not null references public.juegos(id) on delete cascade,
  producto_id uuid not null references public.productos(id) on delete cascade,
  cantidad    integer not null default 1,
  orden       integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists juego_productos_juego_id_idx    on public.juego_productos (juego_id);
create index if not exists juego_productos_producto_id_idx on public.juego_productos (producto_id);

-- 2.7 usuarios (login propio del panel admin) --------------------------------
create table if not exists public.usuarios (
  id            uuid primary key default gen_random_uuid(),
  usuario       text not null unique,
  email         text,
  nombre        text not null,
  password_hash text not null,
  rol           text not null check (rol in ('administrador', 'coordinador')),
  activo        boolean not null default true,
  last_login    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


/* ===========================================================================
   3. Triggers de updated_at (solo tablas que tienen la columna)
   =========================================================================== */

drop trigger if exists set_updated_at on public.categorias;
create trigger set_updated_at before update on public.categorias
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.productos;
create trigger set_updated_at before update on public.productos
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.juegos;
create trigger set_updated_at before update on public.juegos
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.usuarios;
create trigger set_updated_at before update on public.usuarios
  for each row execute function public.set_updated_at();


/* ===========================================================================
   4. RLS
   - Catálogo (6 tablas): lectura completa para anon + authenticated.
   - Escritura: solo service_role (bypasea RLS), usado por el panel admin.
   - usuarios: SIN políticas → nadie lee/escribe salvo service_role.
   =========================================================================== */

alter table public.categorias       enable row level security;
alter table public.productos        enable row level security;
alter table public.producto_colores enable row level security;
alter table public.juegos           enable row level security;
alter table public.juego_colores    enable row level security;
alter table public.juego_productos  enable row level security;
alter table public.usuarios         enable row level security;

drop policy if exists "categorias_select_public" on public.categorias;
create policy "categorias_select_public" on public.categorias
  for select to anon, authenticated using (true);

drop policy if exists "productos_select_public" on public.productos;
create policy "productos_select_public" on public.productos
  for select to anon, authenticated using (true);

drop policy if exists "producto_colores_select_public" on public.producto_colores;
create policy "producto_colores_select_public" on public.producto_colores
  for select to anon, authenticated using (true);

drop policy if exists "juegos_select_public" on public.juegos;
create policy "juegos_select_public" on public.juegos
  for select to anon, authenticated using (true);

drop policy if exists "juego_colores_select_public" on public.juego_colores;
create policy "juego_colores_select_public" on public.juego_colores
  for select to anon, authenticated using (true);

drop policy if exists "juego_productos_select_public" on public.juego_productos;
create policy "juego_productos_select_public" on public.juego_productos
  for select to anon, authenticated using (true);

-- public.usuarios: intencionalmente SIN policies (solo service_role).


/* ===========================================================================
   5. Storage: bucket público "catalogo"
   =========================================================================== */

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalogo',
  'catalogo',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_catalogo" on storage.objects;
create policy "public_read_catalogo" on storage.objects
  for select to anon, authenticated using (bucket_id = 'catalogo');


/* ===========================================================================
   Verificación:
   Descomentar y ejecutar para confirmar que quedó todo creado.
   Esperado: 7 filas (categorias, juego_colores, juego_productos, juegos,
   producto_colores, productos, usuarios), todas con rls_activo = true.

-- select c.relname               as tabla,
--        c.relrowsecurity        as rls_activo,
--        (select count(*) from pg_policies p
--           where p.schemaname = 'public' and p.tablename = c.relname) as policies
--   from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--  where n.nspname = 'public'
--    and c.relkind = 'r'
--    and c.relname in ('categorias','productos','producto_colores','juegos',
--                      'juego_colores','juego_productos','usuarios')
--  order by 1;
--
-- select id, public, file_size_limit from storage.buckets where id = 'catalogo';
   =========================================================================== */


/* ===========================================================================
   6. configuracion — contenido editable del sitio público (una sola fila)
   - Fila única forzada con `id boolean primary key default true check (id)`.
   - Lectura pública (anon) para que el sitio la consuma con la key pública.
   - Escritura solo service_role: panel /admin/configuracion (admin y coordinador).
   =========================================================================== */

create table if not exists public.configuracion (
  id boolean primary key default true check (id),
  telefono_contacto text not null default '+57 350 822 8479',
  whatsapp_numero text not null default '573508228479',
  whatsapp_mensaje text not null default 'Hola, Aluminios A4 👋. Quisiera solicitar información sobre sus productos.',
  email_contacto text not null default 'ventas@aluminiosa4.com',
  direccion_linea1 text not null default 'Cl. 36 #4-19, Comuna 4',
  direccion_linea2 text not null default 'Cali, Valle del Cauca, Colombia',
  maps_query text not null default 'Aluminios A4, Cl. 36 #4-19, Cali, Valle del Cauca',
  hero_titulo text not null default '100% Aluminio de Calidad',
  hero_subtitulo text not null default 'Fabricamos ollas, calderos y utensilios en aluminio resistente y duradero. Descubre nuestro catálogo de ollas individuales y juegos completos.',
  hero_imagen_url text not null default '/hero-a4.png',
  mostrar_franja_confianza boolean not null default true,
  mostrar_destacados boolean not null default true,
  mostrar_nosotros boolean not null default true,
  mostrar_ubicacion boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.configuracion;
create trigger set_updated_at before update on public.configuracion
  for each row execute function public.set_updated_at();

alter table public.configuracion enable row level security;

drop policy if exists configuracion_select_publico on public.configuracion;
create policy configuracion_select_publico on public.configuracion
  for select to anon, authenticated using (true);

-- Fila única inicial (no pisa la existente si ya fue editada desde el panel).
insert into public.configuracion (id) values (true) on conflict (id) do nothing;


/* ===========================================================================
   7. catalogo_pines — PINes de acceso al catálogo (precios de mayorista)
   - El catálogo muestra precios de mayorista: no puede ser público.
   - El middleware exige una cookie firmada que se obtiene canjeando un PIN
     en /api/catalogo/acceso.
   - SIN políticas RLS: solo accesible con service_role. Los PINes nunca se
     exponen al navegador ni a la key pública (anon).
   - Se administran desde el panel en /admin/pines (admin y coordinador).
   =========================================================================== */

create table if not exists public.catalogo_pines (
  id uuid primary key default gen_random_uuid(),
  pin text not null unique,
  etiqueta text,
  notas text,
  activo boolean not null default true,
  expira_at timestamptz,
  ultimo_acceso timestamptz,
  usos integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.catalogo_pines;
create trigger set_updated_at before update on public.catalogo_pines
  for each row execute function public.set_updated_at();

alter table public.catalogo_pines enable row level security;
-- SIN políticas: solo accesible con service role (los PINes nunca se exponen al navegador)

-- PIN semilla de entrega (no pisa cambios hechos desde el panel).
insert into public.catalogo_pines (pin, etiqueta, notas)
values ('aluminiosA4_mayorista*', 'PIN general', 'PIN inicial de entrega; Aluminios A4 puede cambiarlo o crear otros desde el panel.')
on conflict (pin) do nothing;
