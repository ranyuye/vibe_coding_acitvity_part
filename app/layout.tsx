import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "登录｜创意作品征集与投票平台",
  description: "登录后提交创意作品并参与公平投票。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "创意作品征集与投票平台",
    description: "让每一个好创意被看见",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "创意作品征集与投票平台" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "创意作品征集与投票平台",
    description: "让每一个好创意被看见",
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
