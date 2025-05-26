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
    ); if (isProtectedPath && !isAuthenticated) {
        // Redirect to login page if trying to access protected route without authentication
        const loginUrl = new URL("/login", request.url);

        // Store the current URL as the callback URL without reconstructing it
        // This avoids protocol/host detection issues that can occur in different environments
        const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;

        loginUrl.searchParams.set("callbackUrl", callbackUrl);
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
    ]
};
