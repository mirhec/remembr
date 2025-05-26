import { NextRequest, NextResponse } from "next/server";
import { getAuthForMiddleware } from "./lib/middleware-auth";

export async function middleware(request: NextRequest) {
    const session = await getAuthForMiddleware(request);
    const isAuthenticated = !!session?.user;

    // Paths that require authentication
    const protectedPaths = ["/dashboard", "/texts", "/practice"];

    // Check if the path starts with any of the protected paths
    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !isAuthenticated) {
        // Redirect to login page if trying to access protected route without authentication
        const loginUrl = new URL("/login", request.url);

        // Get the hostname from request headers to handle Docker properly
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
        const protocol = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");

        // Create a proper callback URL using the host from headers
        const callbackUrl = `${protocol}://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;

        loginUrl.searchParams.set("callbackUrl", encodeURI(callbackUrl));
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthenticated && (
        request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/register" ||
        request.nextUrl.pathname === "/"
    )) {
        // Redirect to dashboard if trying to access login/register/home when already authenticated
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Protected routes that need authentication
        "/dashboard/:path*",
        "/texts/:path*",
        "/practice/:path*",
        // Routes that should redirect to dashboard if already logged in
        "/login",
        "/register",
        "/",
    ],
    runtime: "experimental-edge" // Aktualisiert auf die empfohlene Runtime
};
