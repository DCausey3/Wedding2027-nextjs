import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes (except /admin/login if you still keep it around)
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        const guestCookie = request.cookies.get("guest");

        if (!guestCookie) {
            // No guest session cookie found -> Redirect to unified login page
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            const guest = JSON.parse(decodeURIComponent(guestCookie.value));
            const role = guest?.role?.toLowerCase();
            const isAuthorized = role === "bride" || role === "groom" || role === "admin";

            if (!isAuthorized) {
                // Logged-in user is a regular guest, not an admin
                return NextResponse.redirect(new URL("/home", request.url));
            }
        } catch {
            // Malformed cookie
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};