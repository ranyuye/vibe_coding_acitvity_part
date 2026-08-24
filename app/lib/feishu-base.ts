const FEISHU_API = "https://open.feishu.cn/open-apis";

const FIELD_NAMES = {
  registrationId: process.env.FEISHU_FIELD_REGISTRATION_ID || "报名ID",
  workName: process.env.FEISHU_FIELD_WORK_NAME || "作品名",
  submitter: process.env.FEISHU_FIELD_SUBMITTER || "提交人",
  submittedAt: process.env.FEISHU_FIELD_SUBMITTED_AT || "报名时间",
  videoUrl: process.env.FEISHU_FIELD_VIDEO_URL || "提交视频链接",
  workUrl: process.env.FEISHU_FIELD_WORK_URL || "作品链接",
  round: process.env.FEISHU_FIELD_ROUND || "当前比赛轮次",
};

const CURRENT_ROUND_NUMBER = Number(process.env.FEISHU_CURRENT_ROUND || "1");
export const CURRENT_ROUND = `第 ${CURRENT_ROUND_NUMBER} 轮 · 作品征集`;

type FeishuResult<T> = {
  code?: number;
  msg?: string;
  data?: T;
  tenant_access_token?: string;
  expire?: number;
};

type BitableField = {
  field_id: string;
  field_name: string;
  type: number;
};

type BitableRecord = {
  record_id: string;
  fields: Record<string, unknown>;
};

type SessionUser = {
  id: string;
  name: string;
};

export type Entry = {
  recordId: string;
  registrationId: string;
  workName: string;
  submitterName: string;
  submittedAt: string | null;
  videoUrl: string | null;
  workUrl: string | null;
  round: string;
};

export class FeishuBaseError extends Error {
  constructor(
    message: string,
    readonly code?: number,
    readonly status = 502,
  ) {
    super(message);
  }
}

let tenantTokenCache: { value: string; expiresAt: number } | null = null;
let resolvedAppToken: string | null = null;

async function getTenantAccessToken() {
  if (tenantTokenCache && tenantTokenCache.expiresAt > Date.now() + 60_000) {
    return tenantTokenCache.value;
  }

  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  if (!appId || !appSecret) {
    throw new FeishuBaseError("飞书应用凭证尚未配置", undefined, 503);
  }

  const response = await fetch(`${FEISHU_API}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    cache: "no-store",
  });
  const result = (await response.json()) as FeishuResult<never>;
  if (!response.ok || result.code !== 0 || !result.tenant_access_token) {
    throw new FeishuBaseError(result.msg || "无法获取飞书应用访问凭证", result.code);
  }

  tenantTokenCache = {
    value: result.tenant_access_token,
    expiresAt: Date.now() + Math.max(60, result.expire || 7200) * 1000,
  };
  return tenantTokenCache.value;
}

async function feishuRequest<T>(path: string, init?: RequestInit) {
  const token = await getTenantAccessToken();
  const response = await fetch(`${FEISHU_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const result = (await response.json()) as FeishuResult<T>;
  if (!response.ok || result.code !== 0 || !result.data) {
    throw new FeishuBaseError(result.msg || "飞书多维表请求失败", result.code);
  }
  return result.data;
}

async function getBaseAppToken() {
  if (resolvedAppToken) return resolvedAppToken;
  const configuredToken = process.env.FEISHU_BASE_APP_TOKEN;
  if (configuredToken) {
    resolvedAppToken = configuredToken;
    return configuredToken;
  }

  const wikiToken = process.env.FEISHU_WIKI_NODE_TOKEN;
  if (!wikiToken) {
    throw new FeishuBaseError("飞书多维表 app_token 尚未配置", undefined, 503);
  }
  const data = await feishuRequest<{ node?: { obj_token?: string; obj_type?: string } }>(
    `/wiki/v2/spaces/get_node?token=${encodeURIComponent(wikiToken)}`,
  );
  if (!data.node?.obj_token) {
    throw new FeishuBaseError("无法从 Wiki 链接解析多维表 app_token", undefined, 503);
  }
  resolvedAppToken = data.node.obj_token;
  return resolvedAppToken;
}

function getWorksTableId() {
  const tableId = process.env.FEISHU_WORKS_TABLE_ID;
  if (!tableId) {
    throw new FeishuBaseError("作品表 table_id 尚未配置", undefined, 503);
  }
  return tableId;
}

async function listFields() {
  const appToken = await getBaseAppToken();
  const tableId = getWorksTableId();
  const data = await feishuRequest<{ items?: BitableField[] }>(
    `/bitable/v1/apps/${encodeURIComponent(appToken)}/tables/${encodeURIComponent(tableId)}/fields?page_size=100`,
  );
  return data.items || [];
}

async function listRecords() {
  const appToken = await getBaseAppToken();
  const tableId = getWorksTableId();
  const records: BitableRecord[] = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams({ page_size: "100", user_id_type: "open_id" });
    if (pageToken) query.set("page_token", pageToken);
    const data = await feishuRequest<{
      items?: BitableRecord[];
      has_more?: boolean;
      page_token?: string;
    }>(
      `/bitable/v1/apps/${encodeURIComponent(appToken)}/tables/${encodeURIComponent(tableId)}/records?${query}`,
    );
    records.push(...(data.items || []));
    pageToken = data.has_more ? data.page_token : undefined;
  } while (pageToken);

  return records;
}

function valueToText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(valueToText).filter(Boolean).join("、");
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return valueToText(item.name || item.text || item.link || item.url || item.id || "");
  }
  return "";
}

function valueHasUser(value: unknown, userId: string): boolean {
  if (typeof value === "string") return value.includes(userId);
  if (Array.isArray(value)) return value.some((item) => valueHasUser(item, userId));
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return item.id === userId || item.open_id === userId || valueHasUser(item.text, userId);
  }
  return false;
}

function valueToDate(value: unknown): string | null {
  const scalar = Array.isArray(value) ? value[0] : value;
  const date = new Date(typeof scalar === "number" ? scalar : valueToText(scalar));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function valueToUrl(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return /^https?:\/\//i.test(value) ? value : null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = valueToUrl(item);
      if (url) return url;
    }
  }
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return valueToUrl(item.link || item.url || item.text);
  }
  return null;
}

function submitterDisplayName(value: unknown) {
  const text = valueToText(value);
  if (/^(ou_|on_|u_)/i.test(text)) return "飞书用户";
  return text.includes("｜") ? text.split("｜")[0] : text || "飞书用户";
}

function recordToEntry(record: BitableRecord): Entry {
  const fields = record.fields;
  const storedRound = valueToText(fields[FIELD_NAMES.round]);
  return {
    recordId: record.record_id,
    registrationId: valueToText(fields[FIELD_NAMES.registrationId]) || record.record_id,
    workName: valueToText(fields[FIELD_NAMES.workName]) || "未命名作品",
    submitterName: submitterDisplayName(fields[FIELD_NAMES.submitter]),
    submittedAt: valueToDate(fields[FIELD_NAMES.submittedAt]),
    videoUrl: valueToUrl(fields[FIELD_NAMES.videoUrl]),
    workUrl: valueToUrl(fields[FIELD_NAMES.workUrl]),
    round: storedRound ? `第 ${storedRound} 轮` : CURRENT_ROUND,
  };
}

export async function listEntries() {
  return (await listRecords()).map(recordToEntry);
}

export async function findRegistrationForUser(userId: string) {
  const record = (await listRecords()).find((item) => valueHasUser(item.fields[FIELD_NAMES.submitter], userId));
  return record ? recordToEntry(record) : null;
}

function writableValue(field: BitableField | undefined, kind: "id" | "user" | "time", value: string, user?: SessionUser) {
  if (!field || [1001, 1002, 1003, 1004, 1005].includes(field.type)) return undefined;
  if (kind === "user") {
    if (field.type === 11) return [{ id: value }];
    return `${user?.name || "飞书用户"}｜${value}`;
  }
  if (kind === "time") return field.type === 5 ? Date.now() : new Date().toISOString();
  return value;
}

export async function createRegistration(user: SessionUser, workName: string) {
  const existing = await findRegistrationForUser(user.id);
  if (existing) return { entry: existing, created: false };

  const fields = await listFields();
  const byName = new Map(fields.map((field) => [field.field_name, field]));
  if (!byName.has(FIELD_NAMES.workName) || !byName.has(FIELD_NAMES.submitter)) {
    throw new FeishuBaseError(`作品表缺少必填字段：${FIELD_NAMES.workName} 或 ${FIELD_NAMES.submitter}`, undefined, 503);
  }

  const registrationId = `VC-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const recordFields: Record<string, unknown> = {
    [FIELD_NAMES.workName]: workName,
  };
  const optionalValues: Array<[string, unknown]> = [
    [FIELD_NAMES.registrationId, writableValue(byName.get(FIELD_NAMES.registrationId), "id", registrationId)],
    [FIELD_NAMES.submitter, writableValue(byName.get(FIELD_NAMES.submitter), "user", user.id, user)],
    [FIELD_NAMES.submittedAt, writableValue(byName.get(FIELD_NAMES.submittedAt), "time", "")],
    [FIELD_NAMES.round, byName.has(FIELD_NAMES.round) ? CURRENT_ROUND_NUMBER : undefined],
  ];
  for (const [name, value] of optionalValues) {
    if (value !== undefined) recordFields[name] = value;
  }

  const appToken = await getBaseAppToken();
  const tableId = getWorksTableId();
  const data = await feishuRequest<{ record?: BitableRecord }>(
    `/bitable/v1/apps/${encodeURIComponent(appToken)}/tables/${encodeURIComponent(tableId)}/records?user_id_type=open_id`,
    { method: "POST", body: JSON.stringify({ fields: recordFields }) },
  );
  if (!data.record) throw new FeishuBaseError("飞书未返回新建的报名记录");
  return { entry: recordToEntry(data.record), created: true };
}

export function publicFeishuError(error: unknown) {
  const appId = process.env.FEISHU_APP_ID;
  const permissionUrl = appId
    ? `https://open.feishu.cn/app/${encodeURIComponent(appId)}/auth?q=bitable:app&op_from=openapi&token_type=tenant`
    : undefined;
  if (error instanceof FeishuBaseError) {
    if (error.code === 99991672) {
      return { status: 503, error: "飞书应用尚未开通多维表读写权限", permissionUrl };
    }
    if (error.code === 131006) {
      return { status: 503, error: "飞书应用尚未获得该 Wiki/多维表的访问权限", permissionUrl };
    }
    if (error.code === 91402) {
      return { status: 503, error: "飞书多维表 app_token 配置不正确" };
    }
    if (error.code === 91403 || error.code === 1254304) {
      return { status: 503, error: "飞书应用尚未被添加为该多维表的文档应用" };
    }
    return { status: error.status, error: error.message };
  }
  return { status: 500, error: "读取飞书多维表时发生未知错误" };
}
