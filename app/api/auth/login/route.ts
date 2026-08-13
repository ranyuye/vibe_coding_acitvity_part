import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const appId = process.env.FEISHU_APP_ID;
  const redirectUri = process.env.FEISHU_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.redirect(new URL("/?error=config_missing", request.url));
  }

  const state = crypto.randomUUID();
  const authorize = new URL("https://accounts.feishu.cn/open-apis/authen/v1/authorize");
  authorize.searchParams.set("client_id", appId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("scope", "auth:user.id:read");

  const response = NextResponse.redirect(authorize);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
