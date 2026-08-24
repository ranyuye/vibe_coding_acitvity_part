# Vibe Coding 创作季 Docker 部署

这套配置包含两个容器：

- `app`：构建并运行 Vinext 生产服务，仅在 Docker 内部监听 `3000`。
- `caddy`：对外监听 `80/443`，自动申请和续期 HTTPS 证书，并将请求转发给应用。

项目数据仍保存在飞书多维表中。服务器不需要额外安装数据库，Caddy 的证书数据会保存在 Docker Volume 中。

## 1. 准备服务器

推荐使用 Ubuntu 或 Debian，并安装 Docker Engine 与 Docker Compose Plugin。

确认安装成功：

```bash
docker --version
docker compose version
```

服务器防火墙和云厂商安全组需要放行：

```text
TCP 80
TCP 443
UDP 443
```

`3000` 端口不需要对公网开放。

## 2. 配置域名

在域名服务商处添加 `A` 记录，将正式域名指向服务器公网 IP。部署前应确认域名已经解析到该服务器，否则 Caddy 无法申请 HTTPS 证书。

## 3. 上传项目

将整个 `vote-site` 目录上传或拉取到服务器，例如：

```bash
cd /opt
git clone <你的仓库地址> vibecoding
cd /opt/vibecoding
```

如果不用 Git，也可以通过 SCP、SFTP 或服务器控制台上传。不要上传本地 `.env.local`。

## 4. 配置生产环境变量

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

编辑 `.env.production`，至少替换：

- `SITE_DOMAIN`
- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_REDIRECT_URI`
- `SESSION_SECRET`
- 飞书多维表相关 Token 和表格 ID

生成 Session 密钥：

```bash
openssl rand -hex 32
```

正式回调地址格式：

```text
https://你的域名/api/auth/callback
```

同一地址还需要添加到飞书开放平台应用的 OAuth 回调白名单中。

## 5. 首次构建和启动

在项目目录执行：

```bash
docker compose --env-file .env.production up -d --build
```

查看状态：

```bash
docker compose --env-file .env.production ps
```

查看应用日志：

```bash
docker compose --env-file .env.production logs -f app
```

查看 HTTPS 和反向代理日志：

```bash
docker compose --env-file .env.production logs -f caddy
```

当 `app` 显示 `healthy` 后，通过 `https://你的域名` 访问网站。

## 6. 更新版本

拉取最新代码后重新构建应用：

```bash
git pull
docker compose --env-file .env.production up -d --build --remove-orphans
```

环境变量有修改时也执行同一条启动命令，Compose 会重新创建应用容器。

## 7. 常用维护命令

重启：

```bash
docker compose --env-file .env.production restart
```

停止服务但保留 HTTPS 证书：

```bash
docker compose --env-file .env.production down
```

再次启动：

```bash
docker compose --env-file .env.production up -d
```

不要执行 `docker compose down -v`，该命令会删除 Caddy 保存的证书 Volume。

## 8. 上线检查

部署完成后依次确认：

1. 首页和移动端可以正常打开。
2. `https://你的域名/register` 可以正常登录和报名。
3. 飞书登录后能正确返回网站。
4. 培训资料和日程链接可以打开。
5. `https://你的域名/entries` 能显示作品市集提示页。
6. 浏览器地址栏显示有效 HTTPS 证书。

## 已有反向代理的服务器

如果服务器已经使用 Nginx、Traefik 或其他网关，可以删除 `compose.yaml` 中的 `caddy` 服务，并将 `app` 的 `expose` 改成只绑定本机：

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

然后让现有网关反向代理到 `http://127.0.0.1:3000`，并继续由现有网关管理 HTTPS。
