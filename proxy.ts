import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 renomeou o antigo `middleware.ts` para `proxy.ts` (mesma
// assinatura de função). O wrapper `auth(...)` do Auth.js v5 retorna uma
// função compatível com essa convenção, dando acesso a `req.auth`.
const publicRoutes = ["/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)"],
};
