import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

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
  matcher: ["/admin/:path*"],
};
