"use client";

import { useEffect, useState, type CSSProperties } from "react";

const START_AT = new Date("2026-08-27T00:00:00+08:00").getTime();
const END_AT = new Date("2026-09-17T23:59:59+08:00").getTime();
const DAY = 24 * 60 * 60 * 1000;

const milestones = [
  { date: "08.27", title: "报名开启", icon: "▶", at: "2026-08-27T00:00:00+08:00", x: 6 },
  { date: "09.03", title: "产研培训", icon: "✦", at: "2026-09-03T00:00:00+08:00", x: 35 },
  { date: "09.14", title: "作品提交", icon: "⇧", at: "2026-09-14T00:00:00+08:00", x: 82 },
  { date: "09.17", title: "线上市集", icon: "▦", at: "2026-09-17T00:00:00+08:00", x: 96 },
];

const minorMilestones = [
  { date: "09.07", title: "中期诊所", at: "2026-09-07T00:00:00+08:00", x: 52 },
  { date: "09.11", title: "部署帮扶", at: "2026-09-11T00:00:00+08:00", x: 68 },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getStatus(now: number) {
  if (now < START_AT) {
    return `距离开赛 ${Math.max(1, Math.ceil((START_AT - now) / DAY))} 天`;
  }
  if (now > END_AT) return "ROUND 01 已通关";
  return "ROUND 01 闯关中";
}

export function HeroTimeline() {
  const [now, setNow] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const current = Date.now();
      setNow(current);
      const nextProgress = clamp(((current - START_AT) / (END_AT - START_AT)) * 100, 0, 100);
      requestAnimationFrame(() => setProgress(nextProgress));
    };

    update();
    const timer = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const resolvedNow = now ?? START_AT - DAY;
  const nextMajorIndex = milestones.findIndex((item) => resolvedNow < new Date(item.at).getTime());
  const routeProgress = 6 + progress * 0.9;
  const style = { "--route-progress": `${routeProgress}%` } as CSSProperties;

  return (
    <div
      className="hero-material hero-material-timeline hero-level-map"
      style={style}
      aria-label="赛程进度：08月27日报名开启，09月03日产研培训，09月14日作品提交，09月17日线上市集"
    >
      <div className="level-map-head">
        <span>ROUND 01 / QUEST ROUTE</span>
        <strong>{now === null ? "赛程载入中" : getStatus(now)}</strong>
      </div>

      <div className="level-route" aria-hidden="true">
        <i className="level-route-base" />
        <i className="level-route-fill" />
        <b className="level-runner">›</b>
      </div>

      <ol className="level-checkpoints">
        {milestones.map((item, index) => {
          const itemTime = new Date(item.at).getTime();
          const state = resolvedNow >= itemTime
            ? "is-cleared"
            : index === nextMajorIndex
              ? "is-next"
              : "is-locked";
          return (
            <li
              className={`level-checkpoint ${state}`}
              style={{ "--checkpoint-x": `${item.x}%` } as CSSProperties}
              key={item.date}
            >
              <span className="level-icon" aria-hidden="true">{item.icon}</span>
              <div><time>{item.date}</time><strong>{item.title}</strong></div>
            </li>
          );
        })}
      </ol>

      <div className="level-minor-points" aria-hidden="true">
        {minorMilestones.map((item) => (
          <span
            className={resolvedNow >= new Date(item.at).getTime() ? "is-cleared" : ""}
            style={{ "--checkpoint-x": `${item.x}%` } as CSSProperties}
            key={item.date}
          >
            <i />
            <small>{item.date} · {item.title}</small>
          </span>
        ))}
      </div>
    </div>
  );
}
