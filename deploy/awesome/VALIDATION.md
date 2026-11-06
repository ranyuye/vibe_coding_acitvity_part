# 交付验证：2026-11-06

- 协议：awesome-deploy-protocol 2026-11-04-r3；用户确认名称 vibevot。
- 真实清单解析：本地社区 vendored awesome_deploy.manifest.load_manifest + Settings（默认每应用 500 MiB）通过；包含 v2 Schema、名称规则、路由和资源校验。不表示线上名称可用或资源已预留。
- Dockerfile：本地 DeploymentBackend._dockerfile 语法检查通过。基础镜像实际拉取后确认无 VOLUME/ONBUILD，amd64。
- 构建：Node v24.14.0、package-lock.json 锁定依赖；独立运行材料无 ELF/Mach-O/native addon，含 JS/WASM。runtime.tar.gz 与源码的 SHA-256 见 artifact.json。
- npm test：通过 2 组测试，覆盖产物与源码一致性、隔离目录启动、首页/报名/作品页、JS/图像资源、未登录 API 拦截、缺少飞书配置的明确错误、OAuth 回调及安全 Cookie。
- 镜像构建：docker build --platform linux/amd64 --network=none 通过，部署 Dockerfile 的 RUN 无需网络。
- 容器运行：Node 22 Linux amd64（本机 ARM Docker 模拟执行）、65532:65532、只读根、cap-drop ALL、no-new-privileges、500 MiB、0.5 CPU、128 PID、64 MiB /tmp noexec。首页、报名页、作品页、favicon、海报均 200；/api/me 与 /api/registration 返回 401；缺少飞书配置的 /api/entries 返回 503。抽查内存约 58 MiB，不代表压力测试结论。
- 新增/修改构建及测试代码的 ESLint、git diff --check 通过。
- 全仓库 lint 尚有原有问题：SiteHeader、entries/page、register/page 合计 8 个普通 a 导航规则错误，另有 6 个 img 优化警告。本次未更改这些页面行为，也未关闭规则掩盖问题。
- 未验证：真实飞书登录回调、表读写授权、实际公网出口、平台秘密配置、线上部署受理及 HTTPS。未创建报名记录，未修改飞书应用权限或后台设置。

现有模板骨架测试针对已不存在的 _sites-preview 文件，已替换为实际网站运行测试。常规 Cloudflare 构建入口仍保留；本次验证针对 Awesome Node 路径。
