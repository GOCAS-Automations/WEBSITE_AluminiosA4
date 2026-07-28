# Manual de uso — Sitio web Aluminios A4

Guía para el equipo de **Aluminios A4** sobre cómo funciona el sitio web público y el panel de
administración. No requiere conocimientos técnicos.

El sitio tiene dos partes:

- **Parte A — Sitio público**: lo que ve cualquier visitante (clientes, vendedores).
- **Parte B — Panel de administración** (`/admin`): donde el equipo de Aluminios A4 carga y
  mantiene el catálogo (productos, juegos, categorías, usuarios).

---

## Parte A — Sitio público

### 1. Página de inicio

Al entrar al sitio se ve:

- Un **encabezado** con el logo, y los enlaces *Inicio*, *Catálogo*, *Nosotros*, *Contacto*, y un
  botón *Empleados* que lleva al panel de administración.
- Una portada de bienvenida con el mensaje de marca y un botón **"Ver catálogo"**.
- Una franja con tres características (100% Aluminio, Con refuerzo, Hecho en Colombia).
- Una sección **"Explora por categoría"** con tarjetas de las 6 categorías (Ollas, Calderos,
  Pailas, Jarras y Jarros, Chocolateras, Complementos), cada una mostrando cuántos productos
  individuales y cuántos juegos tiene.
- Una sección de **productos destacados** (los que se marcan como "Destacado" desde el panel).
  **Importante**: en esta sección de la portada **no se muestra el precio** — fue una decisión
  del cliente para que la página de inicio funcione como vitrina de marca. El precio sí aparece
  en el catálogo y en la ficha de cada producto/juego (ver más abajo).
- Una sección **"Nosotros"** con el texto institucional.
- Una sección **"Visítanos en Cali"** con la dirección (Cl. 36 #4-19, Comuna 4, Cali) y un **mapa
  de Google Maps** embebido, más un botón para abrir la ubicación directamente en Google Maps.
- Un **botón flotante de WhatsApp** (círculo verde, esquina inferior derecha) visible en **todas**
  las páginas del sitio público. Al hacer clic abre WhatsApp con el número **350 822 8479** y un
  mensaje general ya escrito.
- Un **pie de página** con navegación, dirección, correo, teléfono y enlace de WhatsApp.

### 2. Catálogo

Desde *Catálogo* (`/catalogo`) se ve el listado de las 6 categorías. Al entrar a una categoría
(por ejemplo *Ollas*) se ve:

- Dos **pestañas**: **"Ollas individuales"** y **"Juegos de ollas"**, cada una con un contador de
  cuántas referencias tiene.
- Un botón **"Descargar catálogo PDF"** arriba a la derecha. Genera y descarga un PDF con **todas
  las referencias (individuales y juegos) de esa categoría**, con foto (o el aviso de que la foto
  está pendiente), medidas, precio, precio de empaque, y el **código QR de cada referencia**
  impreso en el documento. El PDF **siempre se genera en el momento de la descarga**, con los
  datos y precios que estén cargados en ese instante — no es un archivo fijo guardado de
  antemano, así que refleja cualquier cambio reciente hecho desde el panel.
- La grilla de tarjetas de producto o de juego, según la pestaña elegida.

### 3. Tarjeta de producto (catálogo)

Cada tarjeta de una olla individual muestra:

- **Foto** del producto. Si todavía no se ha cargado una foto real, se muestra automáticamente
  un **placeholder con el logo de Aluminios A4** y el texto "Imagen próximamente" — nunca un
  espacio vacío o una imagen rota.
- Una etiqueta **"Con refuerzo"** si el producto la tiene.
- Un botón **QR** (esquina superior derecha de la foto). Al pulsarlo se abre el código QR en
  grande sobre la misma tarjeta, junto con el texto **"Escanea y realiza tu pedido en el sistema
  de Aluminios A4"** — este es el significado del QR en todo el sitio (ver punto 6 más abajo).
- **Selector de color de tapa**: círculos de color que se pueden pulsar; si ese color tiene su
  propia foto cargada, la imagen de la tarjeta cambia a esa foto.
- **Medidas**: diámetro, altura y/o capacidad (los que apliquen al producto).
- **Empaque**: la nota de la caja (ej. "Caja x 12") y, si el precio del empaque es distinto al
  precio por unidad, también se muestra el **precio del empaque completo**.
- **Colores de manija**, si el producto los tiene registrados.
- **Precio por unidad**, destacado en la parte inferior.
- Un botón redondo de **WhatsApp** que abre una conversación con el mensaje ya escrito,
  mencionando la referencia y el nombre del producto.
- Un botón **"Ver detalle"** que lleva a la ficha completa del producto.

### 4. Tarjeta de juego (catálogo)

Igual que la tarjeta de producto, pero además:

- Una etiqueta **"Juego · N piezas"** con el total de piezas que trae el juego.
- Una lista **"Incluye"** con las ollas individuales que componen el juego (y la cantidad de cada
  una, si es más de una).
- El precio mostrado es el **precio del juego completo**, no el de cada olla por separado.

### 5. Ficha de producto

Al pulsar "Ver detalle" en una olla se abre su ficha completa, con:

- Selector de color de tapa en tamaño grande (misma lógica: si el color tiene foto propia, se
  muestra esa foto).
- **Precio por unidad** destacado.
- Una lista de datos: diámetro, altura, capacidad, colores de manija, si tiene refuerzo, nota de
  empaque, precio de empaque (si aplica) y la referencia (código A4).
- Si el producto tiene QR asignado: el código QR ampliado junto con la explicación de que sirve
  para realizar el pedido en el sistema de Aluminios A4.
- Un botón grande de **"Consultar esta referencia por WhatsApp"**.
- Enlace para volver al catálogo.

### 6. Ficha de juego

Igual que la ficha de producto, pero además incluye la sección **"Este juego incluye"**: la lista
completa de las ollas que forman el juego, cada una con su cantidad, medidas y precio individual,
con enlace a la ficha de esa olla específica.

### 7. Cómo funciona el QR (importante)

En todo el sitio (tarjetas, fichas y catálogo en PDF) el código QR **no** es un enlace a la ficha
del producto ni a una tienda en línea: al escanearlo desde el celular, permite **realizar el
pedido de esa referencia directamente en el sistema interno de Aluminios A4**. Es la misma
explicación en todos los lugares donde aparece el QR.

### 8. Botón "Descargar catálogo PDF"

Disponible en cada categoría del catálogo (`/catalogo/[categoría]`). Al pulsarlo:

- Se genera un PDF **en vivo**, en el momento, con el inventario y los precios actuales de esa
  categoría (individuales y juegos).
- Incluye foto (o aviso de imagen pendiente), medidas, precio, precio de empaque y el **QR de
  cada referencia** (si una referencia no tiene QR o no fue posible descargarlo, el PDF muestra
  "QR pendiente" en su lugar en vez de romper la descarga).
- El archivo se descarga con un nombre como `catalogo-ollas-aluminios-a4.pdf`.

---

## Parte B — Panel de administración

### 1. Cómo entrar

Ir a `/admin` (o pulsar "Empleados" en el menú del sitio). Se pide **usuario** y **contraseña**
(no es necesario correo). Al ingresar correctamente se abre el panel; si no hay sesión iniciada,
cualquier intento de entrar a una página de `/admin` redirige automáticamente al login.

### 2. Roles

| Rol | Qué puede hacer |
|---|---|
| **Administrador** | Todo: productos, juegos, categorías **y usuarios**. |
| **Coordinador** | Solo la gestión del catálogo (productos, juegos, categorías). **No** puede entrar a la sección de Usuarios — si intenta acceder por la dirección directa, el sistema lo regresa al panel. |

### 3. Cambiar contraseñas

Solo el rol **administrador** puede hacerlo:

1. Entrar a **Usuarios** en el menú del panel.
2. Elegir el usuario y pulsar **editar**.
3. Escribir la **nueva contraseña** en el campo correspondiente y guardar.
   - Si se deja el campo en blanco, la contraseña **no cambia**.

> Recomendación: cambiar las contraseñas de prueba (`admin`/`admin123` y
> `coordinador`/`coord123`) antes de empezar a usar el sitio de forma definitiva.

### 4. Productos — crear, editar y eliminar

En **Productos** se ve la lista de todas las ollas individuales. Para crear una nueva, pulsar
**"Nuevo producto"**; para editar una existente, entrar y pulsar sobre ella. El formulario tiene
estas secciones:

- **Datos básicos**: nombre, referencia (código A4), categoría, descripción.
- **Medidas**: diámetro (cm), altura (cm), capacidad (texto libre, ej. "1,4 L").
- **Precio y empaque**: precio por unidad (COP), precio del empaque completo (COP, opcional),
  nota de empaque (ej. "Caja x 12"), colores de manija disponibles (texto, ej. "Negra, Roja"), y
  el interruptor **"Con refuerzo"**.
- **Imágenes**: foto principal del producto y código QR — cada uno se puede **subir como archivo**
  (se guarda en Supabase) o **pegar como URL** externa (por ejemplo un enlace de Cloudinary).
- **Colores de tapa**: agregar uno o más colores (hay botones rápidos para Rojo, Azul, Verde,
  Negro, o se puede escribir cualquier otro); cada color puede tener **su propia foto** del
  producto con esa tapa puesta — es la foto que se muestra en el sitio cuando el visitante elige
  ese color.
- **Publicación**: interruptor **"Visible en el catálogo"** (si se apaga, el producto deja de
  verse en el sitio sin borrarlo), interruptor **"Destacado en el inicio"** (aparece en la
  sección de destacados de la portada), y **orden** (los números más bajos aparecen primero).

Al final del formulario: **"Guardar cambios"** (o "Crear producto") y, si se está editando, un
botón **"Eliminar"** con confirmación (la eliminación no se puede deshacer).

### 5. Juegos — crear, editar y eliminar

Igual que productos, con dos diferencias importantes:

- Una sección **"Ollas del juego"**: se seleccionan (con casillas) las ollas individuales ya
  creadas que componen el juego, y se indica la **cantidad** de cada una. Por eso conviene crear
  primero las ollas individuales antes de armar un juego con ellas.
- No tiene medidas propias ni colores de manija (esos datos los hereda de cada olla incluida);
  en cambio sí tiene su **propia foto**, su **propio código QR** y sus **propios colores de
  tapa**, igual que un producto.
- Al eliminar un juego, **las ollas individuales que lo componen no se eliminan** (solo se borra
  el juego como agrupación).

### 6. Categorías

En **Categorías** se administran las 6 categorías del catálogo (Ollas, Calderos, Pailas, Jarras
y Jarros, Chocolateras, Complementos), cada una con nombre, **slug** (la parte de la dirección web,
se genera automáticamente a partir del nombre pero se puede ajustar), descripción, imagen
opcional, visibilidad y orden.

### 7. Usuarios (solo administrador)

Permite crear, editar y eliminar cuentas de acceso al panel: usuario (para iniciar sesión),
nombre completo, correo (opcional), contraseña, rol (administrador/coordinador) y si la cuenta
está activa. Un usuario no puede cambiar su propio rol ni eliminar su propia cuenta desde aquí.

### 8. Consejos prácticos sobre las fotos

- Tamaño recomendado: fotos **cuadradas**, con **fondo claro o transparente**, para que se vean
  bien tanto en las tarjetas como en el PDF del catálogo.
- Tamaño máximo de archivo: **10 MB** por imagen (el sistema rechaza archivos más grandes).
- Se puede **subir el archivo** directamente desde el panel (queda guardado en Supabase) o
  **pegar una URL** si la foto ya está alojada en otro servicio (Cloudinary, etc.).
- Mientras un producto o juego no tenga foto cargada, el sitio muestra automáticamente el
  **placeholder con el logo de Aluminios A4** — no hace falta hacer nada para que esto funcione,
  es el comportamiento por defecto hasta que se suba la foto real.
