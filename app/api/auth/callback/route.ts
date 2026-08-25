import { NextResponse } from "next/server";
import { secureCookiesEnabled } from "../../../lib/cookie-options";
import { encodeSession } from "../../../lib/session";

type TokenResponse = {
  code?: number;
  access_token?: string;
  error?: string;
};

type FeishuUser = {
  code?: number;
  data?: { open_id?: string; tenant_key?: string; name?: string; avatar_url?: string };
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.headers.get("cookie")?.match(/(?:^|; )oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !savedState || state !== decodeURIComponent(savedState)) {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url));
  }

  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  const redirectUri = process.env.FEISHU_REDIRECT_URI;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!appId || !appSecret || !redirectUri || !sessionSecret) {
    return NextResponse.redirect(new URL("/?error=config_missing", request.url));
  }

  try {
    const tokenResult = await fetch("https://open.feishu.cn/open-apis/authen/v2/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: appId,
        client_secret: appSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    const token = (await tokenResult.json()) as TokenResponse;
    if (!tokenResult.ok || !token.access_token) throw new Error(token.error ?? "token_failed");

    const userResult = await fetch("https://open.feishu.cn/open-apis/authen/v1/user_info", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const user = (await userResult.json()) as FeishuUser;
    if (!userResult.ok || !user.data?.open_id) throw new Error("user_failed");

    const returnToCookie = request.headers.get("cookie")?.match(/(?:^|; )oauth_return_to=([^;]+)/)?.[1];
    const decodedReturnTo = returnToCookie ? decodeURIComponent(returnToCookie) : "/";
    const returnTo = decodedReturnTo.startsWith("/") && !decodedReturnTo.startsWith("//") ? decodedReturnTo : "/";
    const response = NextResponse.redirect(new URL(returnTo, request.url));
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_return_to");
    response.cookies.set("vote_session", await encodeSession({
      sub: user.data.open_id,
      tenant: user.data.tenant_key,
      name: user.data.name,
      avatar: user.data.avatar_url,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    }, sessionSecret), {
      httpOnly: true,
      secure: secureCookiesEnabled(),
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}
