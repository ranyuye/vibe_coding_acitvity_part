import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { RegistrationClient } from "./RegistrationClient";

export default function RegisterPage() {
  return (
    <main className="registration-shell">
      <SiteHeader variant="street" />
      <div className="registration-layout">
        <aside className="registration-aside">
          <Link className="page-back-link" href="/">← 返回创作季主页</Link>
          <p className="micro-label">VIBE CODING 2026</p>
          <h2>创作季报名</h2>
          <p>从一个名字开始，让你的想法在代码中生长。</p>
          <ol>
            <li className="active"><span>01</span> 飞书身份确认</li>
            <li><span>02</span> 提交作品名称</li>
            <li><span>03</span> 后续轮次完善作品</li>
          </ol>
        </aside>
        <div className="registration-main">
          <RegistrationClient />
        </div>
      </div>
    </main>
  );
}
