import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { auth } from "@/auth";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Builds the real public-facing origin from request headers instead of
 * request.url. This avoids a NextAuth quirk where AUTH_URL/NEXTAUTH_URL
 * (if ever set in env vars) silently overrides request.url's origin,
 * which previously caused production redirects to point at localhost.
 */
function getSafeOrigin(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}

export default auth(async (request) => {
  const origin = getSafeOrigin(request);
  const adminLoginUrl = new URL("/admin/login", origin);

  if (request.nextUrl.pathname.startsWith("/account") && !request.auth) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return request.nextUrl.pathname === "/admin/login"
        ? NextResponse.next()
        : NextResponse.redirect(adminLoginUrl);
    }

    let response = NextResponse.next({ request });
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user && request.nextUrl.pathname !== "/admin/login") {
      adminLoginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(adminLoginUrl);
    }

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const isAdmin = profile?.role === "admin";

      if (!isAdmin && request.nextUrl.pathname !== "/admin/login") {
        adminLoginUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(adminLoginUrl);
      }

      if (isAdmin && request.nextUrl.pathname === "/admin/login") {
        return NextResponse.redirect(new URL("/admin", origin));
      }
    }
    return response;
  }
});

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
