import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export {default} from "next-auth/jwt"
// Middleware function
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // If the user is authenticated and trying to access auth-related pages, redirect to dashboard
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify")) 
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If the user is not authenticated and trying to access protected routes, redirect to sign-in
  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Allow unauthenticated access to sign-in, sign-up, verify, or public routes
  return NextResponse.next();
}

// Matching paths
export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*", "/verify/:path*"],
};
