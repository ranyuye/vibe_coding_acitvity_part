"use client";

import { useEffect, useState } from "react";

type User = { id: string; name: string; avatar?: string | null };

export function UserStatus({ variant = "default" }: { variant?: "default" | "street" }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const street = variant === "street";

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(async (response) => response.ok ? (await response.json()).user as User : null)
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) return <span className={`account-skeleton ${street ? "street-account-skeleton" : ""}`} aria-label="正在检查登录状态" />;
  if (!user) return <a className={`login-link ${street ? "street-login-link" : ""}`} href="/api/auth/login?return_to=/">登录</a>;

  return (
    <div className={`user-menu ${street ? "street-user-menu" : ""}`}>
      <span className="avatar">{user.name.slice(0, 1)}</span>
      <span className="user-name">{user.name}</span>
      <a className="logout-link" href="/api/auth/logout">退出</a>
    </div>
  );
}
