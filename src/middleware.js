import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "c5646c8d-91ca-4c52-a8c1-1cd25fb35f9b");
  requestHeaders.set("x-createxyz-project-group-id", "35033089-b7e8-4ac2-9974-79d0da3ff9bf");


  request.nextUrl.href = `https://www.create.xyz/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}