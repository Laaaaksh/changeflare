import { NextResponse } from "next/server";

/**
 * Widget endpoints are read by anonymous visitors on third-party sites, so they
 * must allow cross-origin requests from anywhere. They carry no cookies/auth
 * (fetch uses credentials: "omit" on the widget side) — there is no session to
 * leak, so a wildcard origin is the correct choice here, not a shortcut.
 */
export function withCors(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export function corsPreflight(): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }));
}
