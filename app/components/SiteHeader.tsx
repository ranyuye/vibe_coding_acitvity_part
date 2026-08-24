import { UserStatus } from "./UserStatus";

export function SiteHeader({ variant = "default" }: { variant?: "default" | "street" }) {
  const street = variant === "street";

  return (
    <header className={`main-header ${street ? "street-header" : ""}`} id={street ? "top" : undefined}>
      <a className="vibe-brand" href="/" aria-label="Vibe Coding 创作季首页">
        <span className="vibe-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>VIBE CODING</span>
        <small>创作季</small>
      </a>
      <nav aria-label="主菜单">
        {street ? (
          <>
            <a href="/#about">创作季介绍</a>
            <a href="/#tracks">参赛赛道</a>
            <a href="/#schedule">赛程</a>
            <a href="/#training">培训</a>
            <a href="/entries">作品市集</a>
          </>
        ) : (
          <>
            <a href="/register">创作季报名</a>
            <a href="/#training">培训</a>
            <a href="/entries">作品市集</a>
          </>
        )}
      </nav>
      <UserStatus variant={street ? "street" : "default"} />
    </header>
  );
}
