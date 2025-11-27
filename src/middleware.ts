import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    const path = request.nextUrl.pathname;

    console.log(`[Middleware] Processing path: ${path}`);
    console.log(`[Middleware] Session cookie exists: ${!!session}`);

    // Define protected routes
    // For now, protect everything except public paths
    const isAuthPage = path.startsWith("/login") || path.startsWith("/register");
    const isApiAuth = path.startsWith("/api/auth");
    const isPublic = isAuthPage || isApiAuth;

    // If no session and trying to access protected route
    if (!session && !isPublic) {
        console.log(`[Middleware] No session, redirecting to login`);
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // If session exists
    if (session) {
        try {
            const payload = await decrypt(session);
            console.log(`[Middleware] Session valid for user: ${payload.user.username}`);

            // If session is valid and user is on login/register, redirect to home
            if (isAuthPage) {
                console.log(`[Middleware] User already logged in, redirecting to home`);
                return NextResponse.redirect(new URL("/", request.url));
            }

        } catch (error) {
            console.log(`[Middleware] Session invalid/expired`);
            // Session invalid/expired
            if (!isPublic) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (if any specific ones needed)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
