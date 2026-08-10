import { NextRequest, NextResponse } from "next/server";

const isMaintenanceEnabled = () => [process.env.MAINTENANCE, process.env.MAINTANENCE].some((value) => value?.toLowerCase() === "true");

const errorStatuses = {
  "404": 404,
  "500": 500,
  "501": 501,
  "502": 502,
  "503": 503,
} as const;

export function proxy(request: NextRequest) {
  if (request.cookies.get("devMode")?.value === "true") return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (isMaintenanceEnabled()) {
    const response = pathname === "/503" || pathname === "/error-pages/503"
      ? NextResponse.next({ status: 503 })
      : NextResponse.rewrite(new URL("/error-pages/503", request.url), { status: 503 });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Retry-After", "120");
    return response;
  }

  const match = pathname.match(/^\/(404|500|501|502|503)$/) ?? pathname.match(/^\/error-pages\/(404|500|501|502|503)$/);
  if (!match) return NextResponse.next();

  const code = match[1] as keyof typeof errorStatuses;
  const destination = `/error-pages/${code}`;
  const response = pathname === destination
    ? NextResponse.next({ status: errorStatuses[code] })
    : NextResponse.rewrite(new URL(destination, request.url), { status: errorStatuses[code] });

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
