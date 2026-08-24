import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../lib/session";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: {
      id: session.sub,
      name: session.name || "飞书用户",
      avatar: session.avatar || null,
    },
  });
}
