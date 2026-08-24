import Link from "next/link";
import { UserStatus } from "./UserStatus";

export function SiteHeader({ variant = "default" }: { variant?: "default" | "street" }) {
  const street = variant === "street";

  return (
    <header className={`main-header ${street ? "street-header" : ""}`} id={street ? "top" : undefined}>
      <Link className="vibe-brand" href="/" aria-label="Vibe Coding 创作季首页">
        <span className="vibe-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>VIBE CODING</span>
        <small>创作季</small>
      </Link>
      <nav aria-label="主菜单">
        {street ? (
          <>
            <Link href="/#about">创作季介绍</Link>
            <Link href="/#tracks">参赛赛道</Link>
            <Link href="/#schedule">赛程</Link>
            <Link href="/#training">培训</Link>
            <Link href="/entries">作品市集</Link>
          </>
        ) : (
          <>
            <Link href="/register">创作季报名</Link>
            <Link href="/#training">培训</Link>
            <Link href="/entries">作品市集</Link>
          </>
        )}
      </nav>
      <UserStatus variant={street ? "street" : "default"} />
    </header>
  );
}
