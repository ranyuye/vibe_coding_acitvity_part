"use client";

import { useEffect, useState } from "react";

type Entry = {
  recordId: string;
  registrationId: string;
  workName: string;
  submitterName: string;
  submittedAt: string | null;
  videoUrl: string | null;
  workUrl: string | null;
  round: string;
};

type ApiError = { error?: string; permissionUrl?: string };

function formatDate(value: string | null) {
  if (!value) return "待同步";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EntriesClient() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    fetch("/api/entries", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { entries?: Entry[] } & ApiError;
        if (!response.ok) throw data;
        setEntries(data.entries || []);
      })
      .catch((reason: ApiError) => setError(reason));
  }, []);

  if (error) {
    return (
      <div className="entries-message error-message">
        <span>!</span>
        <h2>暂时无法读取参赛信息</h2>
        <p>{error.error || "请稍后重试"}</p>
        {error.permissionUrl && <a href={error.permissionUrl} target="_blank" rel="noreferrer">去飞书开放平台开通权限 ↗</a>}
      </div>
    );
  }
  if (!entries) return <div className="entries-message"><i /><p>正在从飞书多维表读取作品</p></div>;
  if (!entries.length) {
    return <div className="entries-message"><span>00</span><h2>还没有参赛作品</h2><p>第一条灵感，等你提交。</p></div>;
  }

  return (
    <div className="entries-grid">
      {entries.map((entry, index) => (
        <article className="entry-card" key={entry.recordId}>
          <div className="entry-index">{String(index + 1).padStart(2, "0")}</div>
          <p>{entry.registrationId}</p>
          <h2>{entry.workName}</h2>
          <dl>
            <div><dt>提交人</dt><dd>{entry.submitterName}</dd></div>
            <div><dt>报名时间</dt><dd>{formatDate(entry.submittedAt)}</dd></div>
            <div><dt>当前轮次</dt><dd><span>{entry.round}</span></dd></div>
          </dl>
          {(entry.workUrl || entry.videoUrl) && (
            <footer>
              {entry.workUrl && <a href={entry.workUrl} target="_blank" rel="noreferrer">查看作品 ↗</a>}
              {entry.videoUrl && <a href={entry.videoUrl} target="_blank" rel="noreferrer">观看视频 ↗</a>}
            </footer>
          )}
        </article>
      ))}
    </div>
  );
}
