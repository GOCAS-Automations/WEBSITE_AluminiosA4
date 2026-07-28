export const WHATSAPP_PHONE = "573508228479";

export function waLink(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(mensaje)}`;
}

export const WA_MSG_GENERAL =
  "Hola, Aluminios A4 👋. Quisiera solicitar información sobre sus productos.";
