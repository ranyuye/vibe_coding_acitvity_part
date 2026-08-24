"use client";

import { FormEvent, useEffect, useState } from "react";

type User = { id: string; name: string; avatar?: string | null };
type Registration = {
  registrationId: string;
  workName: string;
  submittedAt: string | null;
  round: string;
};
type ApiError = { error?: string; permissionUrl?: string };

export function RegistrationClient() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [workName, setWorkName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    async function loadRegistration() {
      try {
        const meResponse = await fetch("/api/me", { credentials: "include", cache: "no-store" });
        const currentUser = meResponse.ok ? ((await meResponse.json()).user as User) : null;
        setUser(currentUser);
        if (!currentUser) return;
        const registrationResponse = await fetch("/api/registration", { credentials: "include", cache: "no-store" });
        const data = (await registrationResponse.json()) as { registration?: Registration | null } & ApiError;
        if (!registrationResponse.ok) throw data;
        setRegistration(data.registration || null);
      } catch (reason) {
        setError(reason as ApiError);
        setUser((current) => current === undefined ? null : current);
      }
    }
    void loadRegistration();
  }, []);

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !workName.trim() || registration) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workName: workName.trim() }),
      });
      const data = (await response.json()) as { registration?: Registration } & ApiError;
      if (!response.ok || !data.registration) throw data;
      setRegistration(data.registration);
    } catch (reason) {
      setError(reason as ApiError);
    } finally {
      setSubmitting(false);
    }
  }

  if (user === undefined) {
    return <div className="registration-loading"><i /><span>正在确认飞书登录状态</span></div>;
  }

  if (!user) {
    return (
      <section className="registration-card login-required">
        <span className="step-tag">STEP 01</span>
        <h1>登录后开始报名</h1>
        <p>报名信息将与你的飞书身份关联，用于后续查询作品与当前比赛轮次。</p>
        <a className="primary-action" href="/api/auth/login?return_to=/register">
          <span className="mini-feishu"><i /><i /><i /><i /></span>
          使用飞书账号登录
          <b>→</b>
        </a>
        <div className="privacy-note"><span>✓</span> 仅获取基础身份信息，不读取聊天和文档内容</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="registration-card registered-state error-state">
        <span className="success-seal">!</span>
        <p className="step-tag">FEISHU BASE CONNECTION</p>
        <h1>暂时无法读取报名表</h1>
        <p className="welcome-user">{error.error || "请稍后重试"}</p>
        {error.permissionUrl && <a className="primary-action simple-action" href={error.permissionUrl} target="_blank" rel="noreferrer">去飞书开放平台开通权限 <b>↗</b></a>}
      </section>
    );
  }

  if (registration) {
    return (
      <section className="registration-card registered-state">
        <span className="success-seal">✓</span>
        <p className="step-tag">REGISTRATION CONFIRMED</p>
        <h1>您已报名</h1>
        <p className="welcome-user">{user.name}，已从飞书多维表找到你的报名信息。</p>
        <dl className="registration-summary">
          <div><dt>作品名</dt><dd>{registration.workName}</dd></div>
          <div><dt>报名 ID</dt><dd>{registration.registrationId}</dd></div>
          <div className="round-row"><dt>当前轮次</dt><dd><span>{registration.round}</span></dd></div>
        </dl>
        <p className="storage-note">报名信息存储于飞书多维表，换设备登录也可查询。</p>
      </section>
    );
  }

  return (
    <section className="registration-card">
      <div className="signed-in-line">
        <span className="avatar large-avatar">{user.name.slice(0, 1)}</span>
        <span><small>已使用飞书登录</small><strong>{user.name}</strong></span>
      </div>
      <span className="step-tag">STEP 02</span>
      <h1>提交参赛信息</h1>
      <p>首次报名只需填写作品名，后续轮次将逐步开放视频链接与作品链接提交。</p>
      <form onSubmit={submitRegistration}>
        <label htmlFor="work-name">作品名 <b>*</b></label>
        <input
          id="work-name"
          name="workName"
          type="text"
          value={workName}
          onChange={(event) => setWorkName(event.target.value)}
          placeholder="请输入你的作品名称"
          minLength={2}
          maxLength={80}
          required
        />
        <p className="field-hint">2–80 个字符，提交后本轮暂不支持修改</p>
        <button className="primary-action submit-action" type="submit" disabled={submitting || workName.trim().length < 2}>
          {submitting ? "正在提交…" : "确认报名"}<b>→</b>
        </button>
      </form>
    </section>
  );
}
