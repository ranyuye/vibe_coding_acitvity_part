# Awesome Deploy 交付说明

本项目按 `awesome-deploy-protocol` **2026-11-04-r3** 适配。用户确认的部署名称是 **vibevot**，清单版本为 2；显示名称为「Vibe Coding 创作季」。社区入口固定读取本仓库 `main`，提交时项目名称必须填写 `vibevot`。名称是否占用仍以平台受理检查为准。

## 运行架构

同一个 Node HTTP 服务承载原有 React/vinext 页面、飞书 OAuth、报名和作品列表接口。Awesome 构建选择 Node standalone 输出；原 Cloudflare 开发/构建路径和根目录 Docker Compose 文件保留。

- 监听 `0.0.0.0:8080`，所有路由转发给 web，不去除路径前缀。
- 应用上限 500 MiB，CPU 0.5；Node 堆上限 320 MiB，为其他内存留出余量。尚无并发容量保证。
- 非 root `65532:65532`，只读根文件系统；临时目录 `/tmp`。无需持久卷，业务记录仍在飞书表中，没有改为本地数据库。
- 健康检查请求真实首页 `/`，证明页面服务就绪；不代表飞书凭据、授权范围、表权限已配置正确。
- 必须允许运行时公网 HTTPS 访问 `open.feishu.cn`。仅 internal 网络的目标环境不能完成登录/读写表。浏览器也需要访问飞书登录页和页面中原有外链。

## 部署前配置

在平台为该应用配置以下秘密引用。真实值只放平台，不写进 Git、清单或镜像。

| 平台秘密引用 | 注入应用变量 | 内容 |
| --- | --- | --- |
| VIBEVOT_FEISHU_APP_ID | FEISHU_APP_ID | 业务飞书应用 ID |
| VIBEVOT_FEISHU_APP_SECRET | FEISHU_APP_SECRET | 对应应用 Secret |
| VIBEVOT_SESSION_SECRET | SESSION_SECRET | 至少 32 字符随机会话签名密钥；后续更新保持不变 |
| VIBEVOT_FEISHU_BASE_APP_TOKEN | FEISHU_BASE_APP_TOKEN | 作品多维表格的 Base app token，不是 Wiki 节点 token |
| VIBEVOT_FEISHU_WORKS_TABLE_ID | FEISHU_WORKS_TABLE_ID | 作品表 table ID |

业务资源 ID 也通过引用注入，以免把个人/企业环境固定到可复用源码中。当前接口未使用投票表，因此没有添加无效的投票表引用。使用 Wiki 节点解析的其他部署方式仍由原代码支持。

飞书应用需具有登录和业务表读写所需权限，并被授予作品表访问权。授权回调配置为：

`https://vibevot.awesome.guanghexinzhi.cn/api/auth/callback`

这是按社区既有域名约定写入的目标地址，**不是本次已发布或已预留的地址**。若平台根域名变化，需同时更新 `awesome.yaml` 和飞书后台回调。`COOKIE_SECURE` 保持 `true`，正式环境使用 HTTPS。

非秘密配置（比赛轮次、自定义字段名等）在 `awesome.yaml` 的 `env` 中填写字符串；默认字段名见 `.env.production.example`。平台不会读取仓库 `.env`。

## 离线构建与后续更新

Awesome 的 Docker `RUN` 不联网。因此将锁定依赖编译后的运行包 `deploy/awesome/runtime.tar.gz` 与源码一起提交，部署机只解压，不执行 npm 下载。独立包只含 JS/WASM 运行材料；脚本检查并拒绝本机原生二进制/符号链接，不能将 macOS node_modules 直接当 Linux 依赖交付。图片等公共资源以原始文件保存在 `public/`，Docker 再复制到运行目录，避免在压缩包中重复。

在**没有真实 .env 文件和秘密值**的干净构建目录执行：

```bash
npm ci
npm test
# npm test 会重建离线包，并核对源码哈希、真实页面、静态资源、OAuth 跳转及未登录接口。
# 只重新生成：npm run build:awesome
# 只验证已有包与源码的一致性：npm run test:awesome
```

构建机需要 Node >=22.13.0，联网安装按 package-lock.json 锁定的依赖。每次修改应用源码、公共资源或依赖后，都必须重新生成并提交 `runtime.tar.gz` 和 `artifact.json`。`artifact.json` 记录源码及压缩包 SHA-256，用于发现旧产物。`npm test` 已替换原仓库只针对不存在的 starter skeleton 的陈旧测试。

平台专用 Dockerfile：`deploy/awesome/Dockerfile`。本地等效构建：

```bash
docker build --platform linux/amd64 --network=none -f deploy/awesome/Dockerfile -t vibevot:awesome .
docker run --rm --read-only --user 65532:65532 --cap-drop ALL --security-opt no-new-privileges --memory 500m --pids-limit 128 --tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m -p 127.0.0.1:8080:8080 vibevot:awesome
```

上面命令仅验证无业务凭据时的页面运行；需要完整业务测试时，在本地私有配置中注入业务变量，不提交该文件。平台负责域名、TLS、网络及秘密注入，本次交付不替你执行线上发布或改变飞书应用配置。

## 检查记录

见本次交付的 `deploy/awesome/VALIDATION.md`。静态校验、容器运行、实际飞书操作和 HTTPS 发布是不同的验证层级。
