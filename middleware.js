import { NextResponse } from "next/server";
export const config = { matcher: "/lab/:path*" };

// Set in Vercel → Project → Settings → Environment Variables
const USER = process.env.LAB_USER || "eoin";
const PASS = process.env.LAB_PASS || "buster123";

export function middleware(req) {
  const auth = req.headers.get("authorization");
  if (auth) {
    const [user, pwd] = atob(auth.split(" ")[1]).split(":");
    if (user === USER && pwd === PASS) return NextResponse.next();
  }
  return new Response("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Private Lab"' },
  });
}
