export type VoteSession = {
  sub: string;
  tenant?: string;
  name?: string;
  avatar?: string;
  exp: number;
};

function toBase64Url(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
}

async function sessionKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function encodeSession(data: VoteSession, secret: string) {
  const payload = toBase64Url(JSON.stringify(data));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await sessionKey(secret),
    new TextEncoder().encode(payload),
  );
  return `${payload}.${toBase64Url(signature)}`;
}

export async function decodeSession(value: string, secret: string): Promise<VoteSession | null> {
  try {
    const [payload, signature] = value.split(".");
    if (!payload || !signature) return null;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await sessionKey(secret),
      fromBase64Url(signature),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as VoteSession;
    if (!data.sub || !data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: Request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const cookie = request.headers.get("cookie")?.match(/(?:^|; )vote_session=([^;]+)/)?.[1];
  if (!cookie) return null;
  return decodeSession(decodeURIComponent(cookie), secret);
}
