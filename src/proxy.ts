import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // Let API routes handle auth/errors themselves (JSON 401 instead of HTML redirects).
  if (pathname.startsWith("/api/")) return true;
  return false;
}

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname, search } = nextUrl;

  if (isPublicPath(pathname)) {
    if (req.auth && (pathname === "/login" || pathname === "/register")) {
      const callbackUrl = nextUrl.searchParams.get("callbackUrl");
      const redirectTo = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    const callbackUrl = `${pathname}${search}`;
    const loginUrl = new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
