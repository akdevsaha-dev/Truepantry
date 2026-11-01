import { NextResponse, type NextRequest } from "next/server";
import { isTokenValid } from "@/lib/auth/token";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/cart",
  "/chat",
  "/profile",
  "/onboarding",
];

const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const hasValidToken = Boolean(token && isTokenValid(token));

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If trying to access a protected route without a valid token, redirect to sign-in
  if (isProtectedRoute && !hasValidToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(signInUrl);
    if (token) {
      // Clear expired / invalid cookie
      response.cookies.delete("access_token");
    }
    return response;
  }

  // If already authenticated and trying to access sign-in or sign-up, redirect to dashboard or intended route
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthRoute && hasValidToken) {
    const fromParam = request.nextUrl.searchParams.get("from");
    const targetUrl =
      fromParam && fromParam.startsWith("/") && !fromParam.startsWith("//")
        ? new URL(fromParam, request.url)
        : new URL("/dashboard", request.url);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - api routes (FastAPI proxy handles API auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api).*)",
  ],
};
