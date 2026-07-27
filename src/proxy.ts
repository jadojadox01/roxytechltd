import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STOREKEEPER_ADMIN_PATHS = [
  "/admin/products",
  "/admin/categories",
];

function isStoreKeeperAllowedPath(path: string): boolean {
  return STOREKEEPER_ADMIN_PATHS.some(
    (allowed) => path === allowed || path.startsWith(allowed + "/")
  );
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (path.startsWith("/niyomuhoza")) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin?callbackUrl=/niyomuhoza", req.url));
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    if (token.role === "ADMIN") {
      return NextResponse.next();
    }
    if (token.role === "STORE_KEEPER" && isStoreKeeperAllowedPath(path)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (path.startsWith("/storekeeper")) {
    if (!token || (token.role !== "STORE_KEEPER" && token.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  if (path.startsWith("/checkout") || path.startsWith("/user")) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/niyomuhoza", "/niyomuhoza/:path*", "/admin/:path*", "/storekeeper/:path*", "/checkout", "/user/:path*"],
};
