import Link from "next/link";

export default function DashboardPlaceholder() {
  return (
    <main className="login-shell" style={{ minHeight: "100vh", placeItems: "center", display: "grid" }}>
      <section className="login-card" style={{ minHeight: 0, maxWidth: 520 }}>
        <div className="card-kicker">SIGNED IN</div>
        <h2>登录成功</h2>
        <p>下一步将在这里接入作品提交与投票页面。</p>
        <Link className="feishu-login" href="/">
          <span />
          <span>返回登录页</span>
          <span className="arrow">→</span>
        </Link>
      </section>
    </main>
  );
}
