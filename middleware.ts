import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/account", "/admin"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

function hasSupabaseSession(request: NextRequest): boolean {
  // Supabase stores auth tokens in cookies prefixed with "sb-"
  const cookies = request.cookies.getAll();
  // Look for the access token cookie (sb-<project-ref>-auth-token)
  return cookies.some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /account routes
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Check for Supabase auth session cookie
  if (hasSupabaseSession(request)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
