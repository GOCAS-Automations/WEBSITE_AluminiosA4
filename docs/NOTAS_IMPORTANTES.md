# Notas importantes de entrega — Catálogo Aluminios A4

Este documento reúne toda la información que el equipo de **Aluminios A4** debe conocer sobre
cómo quedó cargado el catálogo en el sitio, a partir de los insumos entregados (Excel de
referencias y PDF de códigos QR). Incluye lo que se cargó, lo que quedó fuera y por qué, y
algunos datos que conviene revisar.

---

## 1. Resumen de datos cargados

| Dato | Cantidad |
|---|---|
| Productos individuales | **124** |
| Juegos | **19** |
| Categorías | **6** (Pailas, Ollas, Calderos, Complementos, Jarras y Jarros, Chocolateras) |
| Colores de tapa — productos | 156 |
| Colores de tapa — juegos | 38 |
| Vínculos juego → producto (composición de juegos) | 98 |

**Detalle por categoría:**

| Categoría | Productos individuales | Juegos |
|---|---|---|
| Pailas | 36 | 3 |
| Ollas | 23 | 9 |
| Calderos | 22 | 7 |
| Complementos | 15 | — |
| Jarras y Jarros | 14 | — |
| Chocolateras | 14 | — |

**Verificación de precios**: se comprobó que `PRECIO VENTA = PRECIO UNIDAD × unidades de
empaque` en las **143 filas** del Excel. Resultado: **0 desviaciones** — el Excel es consistente
en este cálculo en el 100% de las filas.

---

## 2. Artículos EXCLUIDOS del sitio (código = "PENDIENTE" en el Excel)

Estos 3 artículos vienen en el Excel con `CODIGO = PENDIENTE` (sin código de referencia A4), por
lo que **no se cargaron** en el catálogo del sitio:

| Artículo | Precio en el Excel |
|---|---|
| Paila Manija #36 CT | $72.613 |
| Paila Manija #36 ST | PENDIENTE (el precio también aparece pendiente) |
| Escurridor #22 | $14.470 |

**Para incluirlos**: asignarles un código de referencia A4 en el Excel y avisarnos para
recargarlos, o crearlos directamente desde el panel de administración (Productos → Nuevo
producto).

---

## 3. Caldero #30 sin código

La fila de **Caldero #30** en el Excel viene **sin `CODIGO`**. Sí se cargó en el sitio (porque es
una pieza del **Juego Caldero Universal 28-36** y del **Juego Caldero 30-40x25**), pero queda
**sin número de referencia** y, por lo tanto, **sin código QR** propio.

Cuando se le asigne un código A4 en el Excel, se le podrá vincular su QR correspondiente.

---

## 4. Referencias sin código QR

El QR de estas referencias **no aparece** en el PDF de QRs entregado ("QRs A4.pdf"), así que
quedaron cargadas en el sitio **sin QR**:

| Referencia | Artículo |
|---|---|
| A4-145 | Paila Manija #30 ST |
| A4-140 | Paila Mango #20 ST |
| A4-375 | Paila Asa #18 ST |
| A4-196 | Olla Ovalada Manija #3 |
| *(sin código)* | Caldero #30 — ver punto 3 |

Todos los **19 juegos sí tienen QR** asignado.

**Total con QR: 119 productos + 19 juegos.**

---

## 5. Juego Olla Premium x7 14-26 (A4-384) sin composición

Las Ollas Premium individuales (de la #14 a la #26) **no aparecen en el Excel v2** — sí estaban
en la versión anterior del Excel, pero fueron retiradas en la actualización.

Por eso, el **Juego Olla Premium x7 14-26** está publicado en el sitio con su precio, sus colores
de tapa y su código QR, pero **sin la lista de ollas que lo componen** (esa sección aparece
vacía en su ficha).

Si esas referencias individuales vuelven a aparecer en una futura versión del Excel, quedarán
**vinculadas automáticamente** al juego la próxima vez que se recargue el catálogo.

---

## 6. QRs sin referencia en la base de datos (131 códigos)

El PDF de QRs entregado contiene **269 códigos** en total, pero el Excel de referencias solo
tiene **143 artículos**. Esto significa que hay **131 códigos QR** que ya están guardados en el
sistema (en el bucket de imágenes), listos para usarse, pero que **todavía no tienen un
producto o juego asociado** en el catálogo — porque esas referencias no vienen en el Excel
actual.

Cuando esas referencias se agreguen al catálogo (por Excel o desde el panel), sus QR ya están
disponibles y solo falta vincularlos.

**Lista completa de los 131 códigos QR sin referencia asociada:**

```
A4-102  A4-104  A4-106  A4-108  A4-110  A4-111  A4-159  A4-160  A4-161  A4-162
A4-163  A4-164  A4-165  A4-166  A4-167  A4-168  A4-170  A4-199  A4-200  A4-201
A4-202  A4-203  A4-204  A4-205  A4-206  A4-207  A4-208  A4-209  A4-210  A4-211
A4-212  A4-213  A4-214  A4-215  A4-216  A4-217  A4-218  A4-219  A4-220  A4-221
A4-222  A4-223  A4-224  A4-225  A4-226  A4-227  A4-228  A4-229  A4-230  A4-231
A4-232  A4-233  A4-234  A4-235  A4-253  A4-254  A4-256  A4-257  A4-258  A4-259
A4-266  A4-267  A4-268  A4-269  A4-270  A4-271  A4-272  A4-273  A4-274  A4-275
A4-276  A4-277  A4-278  A4-279  A4-280  A4-281  A4-282  A4-283  A4-284  A4-285
A4-287  A4-288  A4-291  A4-324  A4-325  A4-327  A4-337  A4-338  A4-339  A4-340
A4-341  A4-342  A4-343  A4-344  A4-345  A4-346  A4-347  A4-348  A4-349  A4-350
A4-351  A4-352  A4-353  A4-354  A4-355  A4-356  A4-357  A4-358  A4-359  A4-360
A4-369  A4-377  A4-379  A4-382  A4-383  A4-396  A4-397  A4-398  A4-399  A4-400
A4-401  A4-402  A4-403  A4-410  A4-415  A4-428  A4-429  A4-431  A4-500  A4-501
A4-503
```

**Nota**: esta lista incluye los códigos de las Ollas Premium retiradas del Excel
(A4-377 / A4-379 / A4-382 / A4-383 — ver punto 5). También se detectó **1 celda con QR ilegible**
en la **página 9** del PDF de QRs entregado (quedó vacía en el conteo).

---

## 7. Cuentas de acceso al panel

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `coordinador` | `coord123` | Coordinador |

**Recomendación**: cambiar ambas contraseñas desde **Usuarios → editar → nueva contraseña**
antes de que el sitio empiece a usarse en producción con público real.

---

## 8. Datos de contacto configurados en el sitio

| Dato | Valor actual |
|---|---|
| WhatsApp / teléfono | 350 822 8479 |
| Dirección | Cl. 36 #4-19, Comuna 4, Cali |

Avisar si alguno de estos datos cambia, para actualizarlo en el sitio.

---

## 9. Imágenes de productos

Las fotos reales de los productos y juegos quedan **pendientes de cargar por Aluminios A4** desde
el panel de administración. Mientras tanto, el sitio muestra automáticamente el **placeholder
con el logo de la empresa** en cada tarjeta y ficha sin foto — esto es el comportamiento normal,
no un error.

**Únicamente 3 productos y 2 juegos tienen foto de muestra cargada** (para probar que la función
funciona correctamente):

- Olla Manija #14
- Olla Manija #16
- Olla Especial Aro #14
- Juego Olla Manija x5 14-22
- Juego Olla Premium x7

---

## 10. Posibles erratas de medidas en el Excel

Estas medidas se cargaron **tal cual venían en el Excel**; se recomienda revisarlas y corregirlas
(desde el panel o en el Excel de origen antes de una futura recarga):

**8 filas con diámetro "3,5 cm" (dimensión poco probable para estos artículos):**

| Referencia | Artículo |
|---|---|
| A4-103 | Jarra #2 CT |
| A4-105 | Jarra #3 CT |
| A4-109 | Jarra Mango #2 |
| A4-336 | Jarra Mango #3 |
| A4-113 | Olla Ovalada Manija #2 |
| A4-196 | Olla Ovalada Manija #3 |
| A4-115 | Olla Ovalada Aro #2 |
| A4-116 | Olla Ovalada Aro #3 |

**1 fila con medidas probablemente invertidas o con error de dígito:**

| Referencia | Artículo | Medida cargada | Observación |
|---|---|---|---|
| A4-157 | Vaporera #18 | Ø 7 cm, altura 11 cm | El diámetro probablemente debería ser ~18 cm |

---

## Resumen de lo entregado

- **124 productos + 19 juegos**, en **6 categorías**, cargados en el catálogo del sitio.
- **119 productos + 19 juegos con código QR** funcional; el resto queda documentado arriba
  (puntos 2, 3, 4 y 6) con la acción necesaria para completarlo.
- **0 desviaciones** en la verificación de precios del Excel (143/143 filas correctas).
- Pendiente por parte de Aluminios A4: cargar las fotos reales de los productos, revisar las
  erratas de medidas (punto 10), decidir qué hacer con los 3 artículos sin código (punto 2) y
  cambiar las contraseñas de las cuentas de prueba (punto 7).
