import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { CATALOGO_COOKIE, verifyCatalogoToken } from "@/lib/catalogo-acceso";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  /* ---------------------------------------------------------------- catálogo
     El catálogo muestra precios de mayorista: exige PIN (cookie a4_catalogo)
     o sesión del panel. Cubre también el PDF (/api/catalogo/[slug]/pdf), que
     lleva los mismos precios: sin esto el PIN sería inútil con el enlace directo.
  */
  if (pathname === "/catalogo" || pathname.startsWith("/catalogo/") || pathname.startsWith("/api/catalogo/")) {
    // El endpoint que canjea el PIN nunca se bloquea: si no, nadie podría entrar.
    if (pathname === "/api/catalogo/acceso") return NextResponse.next();

    const catalogoToken = req.cookies.get(CATALOGO_COOKIE)?.value;
    const tieneAcceso = Boolean(session) || (catalogoToken ? await verifyCatalogoToken(catalogoToken) : false);
    if (tieneAcceso) return NextResponse.next();

    if (pathname.startsWith("/api/catalogo/")) {
      return NextResponse.json({ error: "Acceso restringido" }, { status: 401 });
    }

    // Rewrite (no redirect): la URL sigue siendo /catalogo… y el lightbox se
    // siente encima de esa ruta. La página real no se renderiza, así que los
    // precios nunca llegan al navegador.
    return NextResponse.rewrite(
      new URL("/acceso-catalogo?next=" + encodeURIComponent(pathname + search), req.url)
    );
  }

  /* ------------------------------------------------------------------ admin */

  // Página de login: si ya hay sesión, ir al panel.
  if (pathname === "/admin/login") {
    return session ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
  }

  // Resto de /admin exige sesión.
  if (!session) {
    const url = new URL("/admin/login", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Gestión de usuarios: solo administrador.
  if (pathname.startsWith("/admin/usuarios") && session.rol !== "administrador") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // /acceso-catalogo NO va en el matcher: es el destino del rewrite (evita bucles).
  matcher: ["/admin/:path*", "/catalogo", "/catalogo/:path*", "/api/catalogo/:path*"],
};
