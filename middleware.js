import { NextResponse } from "next/server";

export const config = {
  matcher: "/lab/:path*",
};

export function middleware(req) {
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");
    if (user === "eoin" && pwd === "buster123") {
      return NextResponse.next();
    }
  }

  return new Response("Auth required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}
