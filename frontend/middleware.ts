import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;
  const host = url.hostname;

  // If user is on the dashboard subdomain root, redirect to the protected dashboard app
  if (host === "dashboard.smart4technology.com" && url.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  // Protect private areas only; marketing pages remain public
  if (
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/account") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api/private/")
  ) {
    await auth.protect();
  }
});

// Invoke on private zones plus root (to enable dashboard subdomain redirect)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/admin/:path*",
    "/api/private/:path*",
    "/",
  ],
};
