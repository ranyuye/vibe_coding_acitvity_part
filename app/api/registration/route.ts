import { NextResponse } from "next/server";
import { createRegistration, findRegistrationForUser, publicFeishuError } from "../../lib/feishu-base";
import { getSessionFromRequest } from "../../lib/session";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "请先使用飞书登录" }, { status: 401 });
  try {
    const registration = await findRegistrationForUser(session.sub);
    return NextResponse.json({ registration }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const result = publicFeishuError(error);
    return NextResponse.json(result, { status: result.status });
  }
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "请先使用飞书登录" }, { status: 401 });

  let workName = "";
  try {
    const body = (await request.json()) as { workName?: unknown };
    workName = typeof body.workName === "string" ? body.workName.trim() : "";
  } catch {
    return NextResponse.json({ error: "报名内容格式错误" }, { status: 400 });
  }
  if (workName.length < 2 || workName.length > 80) {
    return NextResponse.json({ error: "作品名需要为 2–80 个字符" }, { status: 400 });
  }

  try {
    const result = await createRegistration(
      { id: session.sub, name: session.name || "飞书用户" },
      workName,
    );
    return NextResponse.json(
      { registration: result.entry, created: result.created },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    const result = publicFeishuError(error);
    return NextResponse.json(result, { status: result.status });
  }
}
