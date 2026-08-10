import { NextRequest, NextResponse } from "next/server";

const isMaintenanceEnabled = () => [process.env.MAINTENANCE, process.env.MAINTANENCE].some((value) => value?.toLowerCase() === "true");

export function proxy(request: NextRequest) {
  if (!isMaintenanceEnabled() || request.cookies.get("devMode")?.value === "true") return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  const response = pathname === "/503" || pathname === "/error-pages/503"
    ? NextResponse.next({ status: 503 })
    : NextResponse.rewrite(new URL("/error-pages/503", request.url), { status: 503 });

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Retry-After", "120");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
