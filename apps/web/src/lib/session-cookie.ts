// Split out from auth.ts so the Edge middleware (which only needs the cookie
// name) doesn't pull node:crypto into an Edge Runtime bundle.
export const SESSION_COOKIE = "changeflare_session";
