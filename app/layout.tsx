import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Coding 创作季｜让想法落地「花」生",
  description: "面向公司全员的 Vibe Coding 创作季。轻竞技、重展示，让每一个好想法被看见。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Vibe Coding 创作季",
    description: "让想法落地「花」生",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "Vibe Coding 创作季街头拼贴海报" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Coding 创作季",
    description: "让想法落地「花」生",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
