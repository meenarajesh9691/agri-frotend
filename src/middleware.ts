import { NextResponse, type NextRequest } from "next/server";

// Sirf page guard: token cookie hai ya nahi. Asli check backend karta hai.
export function middleware(req: NextRequest) {
  const hasToken = req.cookies.has("shop_token");
  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    return hasToken ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next();
  }
  return hasToken ? NextResponse.next() : NextResponse.redirect(new URL("/login", req.url));
}

export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
