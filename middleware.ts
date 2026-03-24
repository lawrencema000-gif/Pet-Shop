import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PATHS = ["/account", "/admin"];
const ADMIN_PATHS = ["/admin"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

function hasSupabaseSession(request: NextRequest): boolean {
  const cookies = request.cookies.getAll();
  return cookies.some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /account and /admin routes
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Check for Supabase auth session cookie
  if (!hasSupabaseSession(request)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For admin paths, verify admin role server-side
  if (isAdminPath(pathname)) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.next(); // Fall through to client-side guard
      }

      const response = NextResponse.next();

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check admin role via admin_role_cache (no RLS, fast)
      const { data: cacheRow } = await supabase
        .from("admin_role_cache")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!cacheRow || cacheRow.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return response;
    } catch {
      // If server-side check fails, fall through to client-side AdminGuard
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
