import { NextResponse } from "next/server";

type TokenResponse = {
  code?: number;
  access_token?: string;
  error?: string;
};

type FeishuUser = {
  code?: number;
  data?: { open_id?: string; tenant_key?: string; name?: string; avatar_url?: string };
};

function toBase64Url(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function encodeSession(data: object, secret: string) {
  const payload = toBase64Url(JSON.stringify(data));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

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

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.delete("oauth_state");
    response.cookies.set("vote_session", await encodeSession({
      sub: user.data.open_id,
      tenant: user.data.tenant_key,
      name: user.data.name,
      avatar: user.data.avatar_url,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    }, sessionSecret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}
