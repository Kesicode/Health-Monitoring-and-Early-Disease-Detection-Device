import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/explore"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ag_access")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Decode payload (no verify — that's the backend's job)
  try {
    const payloadB64 = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

    // Block expired tokens
    if (payload.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("ag_access");
      return response;
    }

    // Enforce role-based routing
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (pathname.startsWith("/dashboard") && payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)"],
};
