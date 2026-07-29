"use client";

import { useState } from "react";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import { Section, Field, Input, Textarea, Toggle } from "@/components/admin/FormBits";
import type { SiteConfig } from "@/lib/config";
import { saveConfiguracion } from "./actions";

export default function ConfiguracionForm({
  cfg,
  guardado,
}: {
  cfg: SiteConfig;
  guardado?: boolean;
}) {
  // El enlace "Probar en Maps" se arma en vivo con lo que hay escrito en el campo.
  const [mapsQuery, setMapsQuery] = useState(cfg.maps_query);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy">Sitio web</h1>
        <p className="text-sm text-slate-500">
          Datos de contacto, dirección y contenido de la página de inicio. Los cambios se ven de
          inmediato en el sitio público.
        </p>
      </div>

      {guardado && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Cambios guardados. Ya están publicados en el sitio.
        </div>
      )}

      <form action={saveConfiguracion} className="space-y-5">
        <Section
          title="Contacto"
          desc="Se muestra en el pie de página y en los botones de WhatsApp de todo el sitio."
        >
          <Field label="Teléfono visible" hint="Tal como quieres que se lea en el sitio.">
            <Input
              name="telefono_contacto"
              defaultValue={cfg.telefono_contacto}
              placeholder="+57 350 822 8479"
            />
          </Field>

          <Field
            label="Número de WhatsApp"
            hint="Solo dígitos, con el indicativo del país y sin espacios ni signos. Ejemplo: 573508228479"
          >
            <Input
              name="whatsapp_numero"
              inputMode="numeric"
              defaultValue={cfg.whatsapp_numero}
              placeholder="573508228479"
            />
          </Field>

          <Field
            label="Mensaje de WhatsApp"
            hint="Texto con el que se abre la conversación desde el botón general."
          >
            <Textarea
              name="whatsapp_mensaje"
              defaultValue={cfg.whatsapp_mensaje}
              placeholder="Hola, Aluminios A4 👋. Quisiera solicitar información sobre sus productos."
            />
          </Field>

          <Field label="Correo electrónico">
            <Input
              name="email_contacto"
              type="email"
              defaultValue={cfg.email_contacto}
              placeholder="ventas@aluminiosa4.com"
            />
          </Field>
        </Section>

        <Section
          title="Dirección"
          desc="Aparece en el pie de página y en la sección de ubicación del inicio."
        >
          <Field label="Dirección — línea 1">
            <Input
              name="direccion_linea1"
              defaultValue={cfg.direccion_linea1}
              placeholder="Cl. 36 #4-19, Comuna 4"
            />
          </Field>

          <Field label="Dirección — línea 2">
            <Input
              name="direccion_linea2"
              defaultValue={cfg.direccion_linea2}
              placeholder="Cali, Valle del Cauca, Colombia"
            />
          </Field>

          <Field
            label="Búsqueda de Google Maps"
            hint="Texto que se busca en Maps: define el punto del mapa y del botón “Abrir en Google Maps”."
          >
            <Input
              name="maps_query"
              value={mapsQuery}
              onChange={(e) => setMapsQuery(e.target.value)}
              placeholder="Aluminios A4, Cl. 36 #4-19, Cali, Valle del Cauca"
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
              Probar en Maps
            </a>
          </Field>
        </Section>

        <Section
          title="Portada (inicio)"
          desc="El bloque grande con fondo azul que se ve al entrar al sitio."
        >
          <Field label="Título" hint="Frase principal, en una sola línea.">
            <Input
              name="hero_titulo"
              defaultValue={cfg.hero_titulo}
              placeholder="100% Aluminio de Calidad"
            />
          </Field>

          <Field label="Subtítulo" hint="Párrafo corto debajo del título.">
            <Textarea
              name="hero_subtitulo"
              defaultValue={cfg.hero_subtitulo}
              placeholder="Fabricamos ollas, calderos y utensilios en aluminio resistente y duradero…"
            />
          </Field>

          <ImageField
            name="hero_imagen_url"
            label="Imagen de la portada"
            folder="sitio"
            defaultValue={cfg.hero_imagen_url}
            help="Foto que acompaña el título. Se ve mejor con fondo transparente (PNG)."
          />
        </Section>

        <Section
          title="Secciones de la página de inicio"
          desc="Desactiva una sección para ocultarla del sitio sin borrar su contenido."
        >
          <Toggle
            name="mostrar_franja_confianza"
            label="Franja de confianza"
            hint="Los tres puntos con check: 100% Aluminio, Con refuerzo, Hecho en Colombia."
            defaultChecked={cfg.mostrar_franja_confianza}
          />
          <Toggle
            name="mostrar_destacados"
            label="Productos destacados"
            hint="Muestra los productos y juegos marcados como destacados en el panel."
            defaultChecked={cfg.mostrar_destacados}
          />
          <Toggle
            name="mostrar_nosotros"
            label="Sección “Nosotros”"
            hint="Texto de presentación de la empresa y el recuadro de cifras."
            defaultChecked={cfg.mostrar_nosotros}
          />
          <Toggle
            name="mostrar_ubicacion"
            label="Sección “Ubicación”"
            hint="Dirección y mapa de Google al final del inicio."
            defaultChecked={cfg.mostrar_ubicacion}
          />
        </Section>

        <div className="flex items-center gap-3">
          <SubmitButton>Guardar cambios</SubmitButton>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-slate-500 hover:text-navy"
          >
            Ver el sitio
          </a>
        </div>
      </form>
    </div>
  );
}
