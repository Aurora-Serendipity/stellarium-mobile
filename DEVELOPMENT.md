# 开发指南

## 本地开发环境

### 1. 克隆仓库

```bash
git clone https://github.com/Aurora-Serendipity/stellarium-mobile.git
cd stellarium-mobile
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

然后在浏览器中访问 `http://localhost:5173/stellarium-mobile/`

### 4. 构建生产版本

```bash
# 标准构建 (Vite + PWA)
npm run build

# 快速构建 (esbuild, 无 PWA — Termux 兼容)
npx esbuild src/main.js --bundle --outfile=dist/index.js --format=esm --target=es2020 --external:three
```

### 5. 预览构建结果

```bash
npm run preview
```

## 项目结构

```
stellarium-mobile/
├── src/
│   ├── astronomy/         # 天文计算引擎
│   │   ├── coords.js      # 坐标转换 (岁差、章动、恒星时)
│   │   ├── planets.js     # VSOP87 行星位置
│   │   ├── moon.js        # ELP-2000 月球位置
│   │   ├── stars.js       # 恒星位置计算
│   │   ├── time.js        # 儒略日、恒星时
│   │   ├── math.js        # 天文数学工具
│   │   └── index.js
│   ├── render/            # Three.js 渲染器
│   │   ├── renderer.js    # 场景管理、相机、点击检测
│   │   ├── solarSystem.js # 太阳、月球、行星渲染
│   │   ├── planetDetails.js # 土星环、木星卫星
│   │   ├── atmosphere.js  # 大气散射 (Rayleigh/Mie)
│   │   ├── galaxy.js      # 银河辉光
│   │   ├── meteor.js      # 流星雨动画
│   │   ├── satellite.js   # 卫星 Canvas 标签
│   │   ├── performance.js # LOD、视锥体剔除、对象池
│   │   └── index.js
│   ├── sensors/           # 设备传感器
│   │   ├── sensors.js     # 加速度计 + 陀螺仪 + 磁力计融合
│   │   └── index.js
│   ├── data/              # 星表数据
│   │   ├── brightStars.js       # 300+ 亮星星表
│   │   ├── constellationData.js # 星座连线
│   │   ├── dsoCatalog.js        # 深空天体目录
│   │   ├── extendedStars.js     # 扩展星表
│   │   ├── starCatalog.js       # 星表管理器
│   │   └── index.js
│   ├── search/            # 搜索功能
│   │   └── search.js
│   ├── settings/          # 设置面板
│   │   ├── settings.js
│   │   └── settingsUI.js
│   ├── test/              # 测试
│   │   └── astronomy-test.js
│   └── main.js            # 应用入口
├── public/
│   ├── data/              # 静态星表数据
│   ├── textures/          # 纹理资源
│   └── manifest.json      # PWA 配置
├── index.html
├── package.json
├── vite.config.js
├── sync.sh                # 本地同步脚本
└── README.md
```

## Git 工作流

### 方式一：使用同步脚本 (推荐)

```bash
# 查看状态
./sync.sh status

# 拉取远程更新
./sync.sh pull

# 推送本地更改
./sync.sh push
```

### 方式二：手动 Git 操作

```bash
# 拉取更新
git pull origin master

# 提交更改
git add <files>
git commit -m "描述你的更改"
git push origin master
```

### Termux 环境推送

Termux 中 GitHub 直连可能超时，需要通过代理推送：

```bash
git -c http.proxy=http://127.0.0.1:7890 -c https.proxy=http://127.0.0.1:7890 push origin master
```

## 自动部署

每次推送到 `master` 分支时，GitHub Actions 会自动：

1. 构建项目
2. 部署到 `gh-pages` 分支
3. 更新 GitHub Pages 站点

部署状态可在仓库的 Actions 标签页查看。

## 调试提示

### 传感器调试

在 Chrome DevTools → Sensors 面板可以模拟设备方向，无需真机。

### 渲染调试

在浏览器控制台设置：

```js
window.__STELLARIUM_DEBUG__ = true; // 启用调试覆盖层
```

### 性能分析

- 浏览器 Performance 面板 → 查找 GC 抖动 (minor GC 频繁 = 对象池缺失)
- Three.js Stats 面板 → 关注 FPS 和 draw calls
- `src/render/performance.js` 中的 LOD 阈值可在设置面板调节

### 常见问题

| 问题                          | 原因                                     | 解决方案                       |
| ----------------------------- | ---------------------------------------- | ------------------------------ |
| 星空全黑                      | ShaderMaterial 缺少 attribute color      | 检查着色器声明                 |
| `roundRect is not a function` | 旧浏览器/WebView                         | quadraticCurve fallback 已内置 |
| 传感器权限被拒                | iOS 需要 HTTPS + 用户手势                | 确保 PWA 已安装且有 HTTPS      |
| vite build 失败               | vite-plugin-pwa 在 Termux sandbox 中异常 | 用 esbuild 替代构建            |

## 版本历史

| 版本   | 日期       | 说明                           |
| ------ | ---------- | ------------------------------ |
| v0.2.1 | 2026-05-24 | 10 个关键 bug 修复，稳定性提升 |
| v0.2.0 | 2026-05    | 完整功能开发，8 阶段全部完成   |
| v0.1.0 | 2026-04    | 初始版本，项目搭建             |
