import { NextResponse } from "next/server";
import { listEntries, publicFeishuError } from "../../lib/feishu-base";

export async function GET() {
  try {
    const entries = await listEntries();
    return NextResponse.json({ entries }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const result = publicFeishuError(error);
    return NextResponse.json(result, { status: result.status });
  }
}
