# Vibe Coding 案例拆分素材

这套文件分为三层，避免把“原图裁切”和“透明可复用素材”混在一起：

## 1. `exact-crops/`：案例原像素裁切

这些文件直接来自案例图，不重绘、不改字，适合对照尺寸、位置和纹理。

- `reference-case.png`：完整案例图（1672 × 941）
- `reference-logo.png`：用户提供的 Logo 原图
- `title-exact.png`：VIBE CODING 标题区域
- `slogan-exact.png`：绿色口号条
- `register-exact.png`：立即报名区域（保留案例中的鼠标指针）
- `market-exact.png`：作品市集区域
- `login-exact.png`：登录按钮区域
- `round-exact.png`：ROUND 01 区域
- `timeline-exact.png`：底部赛程条区域

原像素裁切会保留附近背景，因此不是透明图。

## 2. `transparent/`：网页可叠加 PNG

这些文件根据案例拆分后移除了背景，可直接放进 `<img>`、绝对定位层、视差层或呼吸动画中。

- `vibe-coding-title.png`
- `vibe-logo.png`
- `register-button.png`（无鼠标指针）
- `market-button.png`
- `login-button.png`
- `round-01.png`
- `timeline-strip.png`

透明版使用内置图像编辑生成纯色键控底，再在本地移除键色。它们保留案例的构图、文字、颜色和材质语言，但边缘及局部纹理不等同于原图逐像素抠图；需要绝对像素一致时，请使用 `exact-crops/`。

## 3. `background/`：无前景底图

- `hero-background-generated.png`：移除标题、Logo、按钮、导航、轮次牌和赛程条后重建的黑色拼贴底图，尺寸 1672 × 941。

该底图是依据案例重建的干净底板，不是被遮挡区域的真实原像素恢复。

## 建议网页层级

1. `hero-background-generated.png`
2. `vibe-coding-title.png`
3. `vibe-logo.png`
4. `round-01.png`
5. `register-button.png` / `market-button.png` / `login-button.png`
6. `timeline-strip.png`

Logo 适合 2.5–3.5 秒呼吸动画；按钮适合轻微旋转与按压位移；标题适合小幅纸张卷边或摆动动画。

