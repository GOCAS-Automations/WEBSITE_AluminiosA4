<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Aluminios A4

Este archivo es un resumen rápido. La referencia completa (stack, mapa de `src/`, modelo de
datos, auth, política de imágenes, significado del QR, env vars, despliegue) está en
**[`CLAUDE.md`](./CLAUDE.md)** — léelo antes de hacer cambios no triviales.

## Comandos esenciales

```bash
npm run dev                                    # desarrollo (http://localhost:3000)
npm run build                                  # build de producción
npm run lint                                   # eslint
node --env-file=.env.local scripts/test-admin.mjs   # smoke test de la capa admin
node scripts/upload-seed.mjs [carpeta-origen]       # sube imágenes de ejemplo al bucket
```

## Flujo de trabajo de agentes (Fable / Opus / Sonnet)

Cuando la sesión corre con el modelo **Fable**, Fable solo planifica, orquesta y verifica; no
ejecuta cambios directamente. Toda ejecución real se delega vía la herramienta Agent a
**Opus** (tareas complejas / con juicio) o **Sonnet** (tareas mecánicas / acotadas). Detalle
completo en `CLAUDE.md` → sección "Flujo de trabajo de agentes".

## Advertencias

- **Nunca commitear `.env.local`** ni pegar sus valores (URL, keys, `SESSION_SECRET`) en código,
  commits o documentación. Solo `.env.example` (sin valores reales) va en el repo.
- **No modifiques usuarios en la base de datos** (tabla `usuarios`, contraseñas, roles) sin que
  se pida explícitamente — incluye no resetear ni crear cuentas de prueba adicionales por tu
  cuenta.
