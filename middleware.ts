import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Seuls les paths « /admin » sont protégés, adapte suivant tes besoins :
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  // getToken attrape le token JWT (fonctionne SSR/edge)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // Token pas présent : pas connecté (redirige)
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  // Si pas admin : redirige
  if (token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

// Les paths protégés :
export const config = {
  matcher: ["/admin/:path*"],
};
