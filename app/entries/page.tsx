import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

export default function EntriesPage() {
  return (
    <main className="entries-shell">
      <SiteHeader variant="street" />
      <section className="entries-market-stage" aria-labelledby="market-title">
        <div className="entries-market-utility">
          <Link className="page-back-link" href="/">← 返回创作季主页</Link>
          <span>ENTRIES / 2026</span>
        </div>

        <div className="entries-market-panel">
          <img src="/assets/collage/vibe-logo.png" alt="Vibe Coding 创作季 Logo" />
          <p className="micro-label">WORKS MARKET / COMING SOON</p>
          <h1 id="market-title">作品市集</h1>
          <div className="market-divider" aria-hidden="true"><i /><i /><i /></div>
          <h2>活动结束后再来查看<br /><span>优秀作品吧～</span></h2>
          <p className="market-note">灵感正在生长，作品将在活动结束后集中亮相。</p>
        </div>
      </section>
    </main>
  );
}
