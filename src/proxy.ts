import { NextRequest, NextResponse } from "next/server";

const isMaintenanceEnabled = () => [process.env.MAINTENANCE, process.env.MAINTANENCE].some((value) => value?.toLowerCase() === "true");

export function proxy(request: NextRequest) {
  if (request.cookies.get("devMode")?.value === "true") return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (isMaintenanceEnabled()) {
    const response = pathname === "/error-pages/503"
      ? NextResponse.next()
      : NextResponse.rewrite(new URL("/error-pages/503", request.url));

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Retry-After", "120");
    response.headers.set("X-App-Error-Code", "503");
    return response;
  }

  const match = pathname.match(/^\/(404|500|501|502|503)$/) ?? pathname.match(/^\/error-pages\/(404|500|501|502|503)$/);
  if (!match) return NextResponse.next();

  const code = match[1];
  const destination = `/error-pages/${code}`;
  const response = pathname === destination
    ? NextResponse.next()
    : NextResponse.rewrite(new URL(destination, request.url));

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("X-App-Error-Code", code);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
