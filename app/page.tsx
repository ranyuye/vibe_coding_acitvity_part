import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function Notice({ type }: { type?: string }) {
  if (!type) return null;

  const messages: Record<string, string> = {
    oauth_failed: "登录没有完成，请重新尝试。",
    invalid_state: "登录请求已过期，请重新发起登录。",
    config_missing: "登录服务尚未完成配置，请联系活动管理员。",
  };

  return (
    <div className="notice" role="alert">
      {messages[type] ?? "登录暂时不可用，请稍后重试。"}
    </div>
  );
}

function FeishuMark() {
  return (
    <span className="feishu-mark" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="login-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="创意作品征集与投票平台首页">
          <span className="brand-symbol" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>创意作品征集与投票平台</span>
        </Link>
        <div className="round-badge">2026</div>
      </header>

      <section className="login-stage">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <div className="intro-panel">
          <p className="eyebrow"><span /> 让每一个好创意被看见</p>
          <h1>
            提交你的作品，
            <br />
            为喜欢的创意投票。
          </h1>
          <p className="intro-copy">
            一个面向创作者与评选者的作品平台。
            <br />
            登录后即可提交作品、浏览入围项目并参与投票。
          </p>
          <div className="flow" aria-label="活动流程">
            <span><b>01</b> 登录</span>
            <i />
            <span><b>02</b> 提交作品</span>
            <i />
            <span><b>03</b> 参与投票</span>
          </div>
        </div>

        <section className="login-card" aria-labelledby="login-title">
          <div className="card-kicker">WELCOME</div>
          <h2 id="login-title">欢迎参与</h2>
          <p>请使用飞书账号登录，继续提交作品或参与投票。</p>

          <Notice type={error} />

          <a className="feishu-login" href="/api/auth/login">
            <FeishuMark />
            <span>使用飞书账号登录</span>
            <span className="arrow" aria-hidden="true">→</span>
          </a>

          <div className="assurance">
            <span className="shield" aria-hidden="true">✓</span>
            <span>
              <strong>安全登录</strong>
              仅用于确认参与身份，不会读取聊天和文档内容
            </span>
          </div>

          <div className="divider"><span>登录后你可以</span></div>

          <ul className="benefits">
            <li><span>↗</span> 提交并管理自己的参赛作品</li>
            <li><span>♡</span> 为你支持的作品投出唯一一票</li>
            <li><span>◎</span> 随时查看作品与活动进展</li>
          </ul>

          <p className="terms">
            登录即表示你同意遵守本次活动规则与隐私说明
          </p>
        </section>
      </section>

      <footer>
        <span>© 2026 创意作品征集与投票平台</span>
        <span>公平 · 真实 · 尊重每一份创意</span>
      </footer>
    </main>
  );
}
