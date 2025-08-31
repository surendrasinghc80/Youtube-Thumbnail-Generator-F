import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Auth routes that should redirect to /app if already authenticated
    const authRoutes = ["/login", "/signup"];

    // Check if current path is an auth route
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // If user is authenticated and trying to access auth routes, redirect to app
    if (isAuthRoute && token) {
      return NextResponse.redirect(new URL("/app", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Protected routes that require authentication
        const protectedRoutes = ["/app"];

        // Check if current path is protected
        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route)
        );

        // Allow access to non-protected routes
        if (!isProtectedRoute) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
