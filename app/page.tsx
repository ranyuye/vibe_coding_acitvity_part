import { SiteHeader } from "./components/SiteHeader";
import { HeroTimeline } from "./components/HeroTimeline";

const tracks = [
  {
    index: "01",
    name: "业务实战",
    label: "WORK",
    copy: "把日常工作里的真实问题，做成能被使用的轻量工具。",
    tone: "track-purple",
  },
  {
    index: "02",
    name: "生活工具",
    label: "LIFE",
    copy: "从自己的需求出发，让一个小想法解决生活中的具体麻烦。",
    tone: "track-blue",
  },
  {
    index: "03",
    name: "艺术游戏",
    label: "PLAY",
    copy: "用代码表达审美、情绪和玩法，让灵感成为可体验的作品。",
    tone: "track-orange",
  },
];

const schedule = [
  { date: "08.27", title: "报名开启", icon: "▶" },
  { date: "09.03", title: "产研培训", icon: "✦" },
  { date: "09.14", title: "作品提交", icon: "⇧" },
  { date: "09.17", title: "线上市集", icon: "▦" },
];

const trainingSessions = [
  {
    date: "2026.09.03 / 周四",
    time: "16:00 - 17:00",
    title: "产品经理思维培训",
    href: "https://www.feishu.cn/calendar/share?token=28f668a7d3d9042e638536858cbfcdbf",
  },
  {
    date: "2026.09.07 / 周一",
    time: "14:00 - 17:00",
    title: "中期帮扶",
    href: "https://www.feishu.cn/calendar/share?token=a453d9a4936baf5d92d76dbeea804f30",
  },
  {
    date: "2026.09.11 / 周五",
    time: "14:00 - 17:00",
    title: "部署帮扶",
    href: "https://www.feishu.cn/calendar/share?token=b2e24bc912d428007f499d0f4af25f49",
  },
];

export default function Home() {
  return (
    <main className="home-shell street-home">
      <SiteHeader variant="street" />

      <section className="street-hero" aria-labelledby="hero-title">
        <div className="hero-reference-stage">
          <h1 id="hero-title" className="sr-only">VIBE CODING 创作季</h1>
          <img
            className="hero-material hero-material-title"
            src="/assets/collage/vibe-coding-title.png"
            alt="VIBE CODING"
          />
          <p className="hero-material-slogan">让想法落地 <b>「花」</b>生</p>
          <img
            className="hero-material hero-material-logo"
            src="/assets/collage/vibe-logo.png"
            alt="Vibe Coding 创作季 Logo"
          />
          <img
            className="hero-material hero-material-round"
            src="/assets/collage/round-01.png"
            alt="当前轮次：ROUND 01"
          />
          <a className="hero-material-link hero-material-register" href="/register">
            <img src="/assets/collage/register-button.png" alt="" />
            <span className="sr-only">立即报名</span>
          </a>
          <a className="hero-material-link hero-material-market" href="/entries">
            <img src="/assets/collage/market-button.png" alt="" />
            <span className="sr-only">作品市集</span>
          </a>
          <HeroTimeline />
        </div>
      </section>

      <section className="street-screen street-about" id="about" aria-labelledby="about-title">
        <div className="street-section-head">
          <p><span>02</span> ABOUT THE EVENT</p>
          <div className="pixel-dots" aria-hidden="true"><i /><i /><i /><i /></div>
        </div>

        <div className="street-about-grid">
          <div className="street-about-copy">
            <p className="collage-label">不设技术门槛 · 个人参赛</p>
            <h2 id="about-title">不是考试，<br />是一场<span>创作市集</span></h2>
            <p>Vibe Coding 创作季面向公司全员。我们更在意你的想法解决了什么、带来了什么体验，而不是使用了多复杂的技术。</p>
            <ul>
              <li><b>轻竞技</b><span>让创作被看见，不制造技术焦虑</span></li>
              <li><b>重展示</b><span>用作品交流想法，用体验获得反馈</span></li>
            </ul>
          </div>

          <aside className="round-poster" aria-label="当前轮次">
            <span>NOW PLAYING</span>
            <strong>ROUND<br /><em>01</em></strong>
            <p>作品征集进行中</p>
            <div className="pixel-progress" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
          </aside>
        </div>

        <div className="track-section" id="tracks">
          <div className="track-title-row">
            <p>CHOOSE YOUR TRACK</p>
            <h3>三条赛道，<span>一种冲动</span></h3>
          </div>
          <div className="track-grid">
            {tracks.map((track) => (
              <article className={`track-card ${track.tone}`} key={track.name}>
                <span className="track-index">{track.index}</span>
                <small>{track.label}</small>
                <h4>{track.name}</h4>
                <p>{track.copy}</p>
                <b aria-hidden="true">↗</b>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="street-screen street-training" id="training" aria-labelledby="training-title">
        <div className="street-section-head street-section-head-dark">
          <p><span>03</span> TRAINING CAMP</p>
          <div className="training-sticker" aria-hidden="true">LEARN / BUILD / SHIP</div>
        </div>

        <div className="training-layout">
          <div className="training-intro">
            <p className="collage-label">VIBE CODING 创作季 · 培训板块</p>
            <h2 id="training-title">有人带路，<br /><span>创作更快。</span></h2>
            <p>从产品思维到中期排障、最终部署，三场集中培训陪你把作品真正做出来。</p>
          </div>

          <div className="training-grid">
            <a
              className="training-card training-archive training-calendar"
              href="https://guanghe.feishu.cn/sync/EwBbdD69fsEbr5bf6qWcY5wwnvb"
              target="_blank"
              rel="noreferrer"
            >
              <span className="training-card-index">ARCHIVE / 01</span>
              <p>往期培训资料</p>
              <h3>Codex 训练营</h3>
              <strong>课程主要信息汇总</strong>
              <small>查看往期资料 <b aria-hidden="true">↗</b></small>
            </a>

            {trainingSessions.map((session, index) => (
              <a
                className="training-card training-calendar"
                href={session.href}
                target="_blank"
                rel="noreferrer"
                key={session.href}
              >
                <span className="training-card-index">CALENDAR / 0{index + 2}</span>
                <p>{session.date}</p>
                <h3>{session.title}</h3>
                <strong>{session.time} (GMT+8)</strong>
                <small>加入飞书日程 <b aria-hidden="true">↗</b></small>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="street-screen street-finale" id="schedule" aria-labelledby="schedule-title">
        <div className="street-section-head street-section-head-dark">
          <p><span>04</span> EVENT TIMELINE</p>
          <div className="pixel-hearts" aria-hidden="true">♥ ♥ ♥</div>
        </div>

        <div className="schedule-poster">
          <div className="schedule-lead">
            <p>ROUND 01 / 进行中</p>
            <h2 id="schedule-title">把灵感，<br /><span>推上舞台。</span></h2>
          </div>
          <ol className="schedule-list">
            {schedule.map((item, index) => (
              <li key={item.date} className={index === 0 ? "is-current" : ""}>
                <span className="schedule-icon" aria-hidden="true">{item.icon}</span>
                <div><time>{item.date}</time><strong>{item.title}</strong></div>
                <i aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>

        <div className="final-cta">
          <p>VIBE CODING 2026</p>
          <h2>让想法落地<br /><span>「<b className="peanut-shake">花</b>」<b className="peanut-shake">生</b></span></h2>
          <div>
            <a className="paper-cta paper-cta-lime" href="/register">立即报名 <span>↗</span></a>
            <a className="paper-cta paper-cta-orange" href="/entries">看看作品 <span>→</span></a>
          </div>
        </div>

        <footer className="street-footer">
          <span>VIBE CODING 创作季</span>
          <span>业务实战 / 生活工具 / 艺术游戏</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </section>
    </main>
  );
}
