import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/profile"];
const publicAuthPaths = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("gigflow_token")?.value;
  const path = request.nextUrl.pathname;

  if (protectedPaths.some((item) => path.startsWith(item)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (publicAuthPaths.includes(path) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/login", "/register"],
};
