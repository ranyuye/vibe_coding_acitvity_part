"use client";

import { useEffect, useState, type CSSProperties } from "react";

const START_AT = new Date("2026-08-27T00:00:00+08:00").getTime();
const END_AT = new Date("2026-09-17T23:59:59+08:00").getTime();
const DAY = 24 * 60 * 60 * 1000;

const milestones = [
  { date: "08.27", title: "报名开启", icon: "start", at: "2026-08-27T00:00:00+08:00", x: 6 },
  { date: "09.03", title: "产研培训", icon: "training", at: "2026-09-03T00:00:00+08:00", x: 35 },
  { date: "09.14", title: "作品提交", icon: "submit", at: "2026-09-14T00:00:00+08:00", x: 76 },
  { date: "09.17", title: "线上市集", icon: "market", at: "2026-09-17T00:00:00+08:00", x: 95 },
];

const minorMilestones = [
  { date: "09.07", title: "中期诊所", at: "2026-09-07T00:00:00+08:00", x: 50 },
  { date: "09.11", title: "部署帮扶", at: "2026-09-11T00:00:00+08:00", x: 63 },
];

const routeStops = [
  { at: START_AT, x: 6 },
  { at: new Date("2026-09-03T00:00:00+08:00").getTime(), x: 35 },
  { at: new Date("2026-09-07T00:00:00+08:00").getTime(), x: 50 },
  { at: new Date("2026-09-11T00:00:00+08:00").getTime(), x: 63 },
  { at: new Date("2026-09-14T00:00:00+08:00").getTime(), x: 76 },
  { at: new Date("2026-09-17T00:00:00+08:00").getTime(), x: 95 },
  { at: END_AT, x: 96 },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getRouteProgress(now: number) {
  if (now <= routeStops[0].at) return routeStops[0].x;
  if (now >= routeStops[routeStops.length - 1].at) return routeStops[routeStops.length - 1].x;
  const segmentIndex = routeStops.findIndex((stop) => now < stop.at);
  const previous = routeStops[segmentIndex - 1];
  const next = routeStops[segmentIndex];
  const ratio = clamp((now - previous.at) / (next.at - previous.at), 0, 1);
  return previous.x + (next.x - previous.x) * ratio;
}

function getStatus(now: number) {
  if (now < START_AT) {
    return `距离开赛 ${Math.max(1, Math.ceil((START_AT - now) / DAY))} 天`;
  }
  if (now > END_AT) return "ROUND 01 已通关";
  return "ROUND 01 闯关中";
}

function getTimelineOverride() {
  const value = new URLSearchParams(window.location.search).get("timeline");
  if (!value || !/^2026-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00+08:00`).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export function HeroTimeline() {
  const [now, setNow] = useState<number | null>(null);
  const [progress, setProgress] = useState(6);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    const update = () => {
      const override = getTimelineOverride();
      const current = override ?? Date.now();
      setIsSimulated(override !== null);
      setNow(current);
      const nextProgress = getRouteProgress(current);
      requestAnimationFrame(() => setProgress(nextProgress));
    };

    update();
    const timer = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const resolvedNow = now ?? START_AT - DAY;
  const nextMajorIndex = milestones.findIndex((item) => resolvedNow < new Date(item.at).getTime());
  const style = { "--route-progress": `${progress}%` } as CSSProperties;

  return (
    <div
      className="hero-material hero-material-timeline hero-level-map"
      style={style}
      aria-label="赛程进度：08月27日报名开启，09月03日产研培训，09月14日作品提交，09月17日线上市集"
    >
      <div className="level-map-head">
        <span>ROUND 01 / QUEST ROUTE</span>
        <strong>{now === null ? "赛程载入中" : `${getStatus(now)}${isSimulated ? " · TEST" : ""}`}</strong>
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
              <span className={`level-icon level-icon-${item.icon}`} aria-hidden="true"><i /></span>
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
