import { waLink, WA_MSG_GENERAL } from "@/lib/whatsapp";

export default function WhatsAppFloat() {
  return (
    <a
      href={waLink(WA_MSG_GENERAL)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
      style={{ backgroundColor: "#25D366" }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a10 10 0 0 0 4.9 1.25h.01c5.52 0 10-4.48 10-10S17.56 2 12.04 2Zm5.85 14.24c-.25.7-1.23 1.28-2.02 1.45-.55.11-1.26.2-3.66-.79-2.66-1.1-4.5-3.7-4.63-3.87-.13-.17-1.1-1.47-1.1-2.8s.68-1.98.93-2.25c.24-.27.53-.34.71-.34.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.57.81 1.98.88 2.13.07.14.11.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.27.71 1.17 1.53 1.89 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.05.16-.18.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.27.14.44.2.5.31.07.13.07.7-.18 1.39Z" />
      </svg>
    </a>
  );
}
