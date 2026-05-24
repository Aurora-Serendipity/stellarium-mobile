# 🌟 星象馆 Stellarium Mobile

移动端专业级实时天文观测应用，支持设备方向追踪与 AR 星空体验。

## 功能特性

### 🌌 星空渲染

- **实时星图**：基于专业天文算法，精确显示当前时间、地点的星空
- **300+ 亮星渲染**：支持按星等/色指数/光谱型分类，带星座连线
- **银河系辉光**：基于位置的银河系 diffuse 光晕
- **大气散射模拟**：Rayleigh 散射 + Mie 散射，天顶变暗效果
- **流星雨**：程序化生成流星轨迹动画

### 🪐 太阳系天体

- **太阳**：辉光球 (glow sphere) + 日冕效果
- **月球**：ELP-2000 理论，真实月相
- **八大行星**：VSOP87 解析理论，含土星环 + 木星四大卫星
- **点击查看行星详**��：轨道、物理参数、实时位置信息

### 🔭 深空天体

- **梅西耶天体** (M1-M110)
- **科德韦尔天体**
- **NGC/IC 精选天体**
- **点击查看天体详情**：类型、星座、视星等、距离

### 🧭 交互功能

- **AR 模式**：跟随设备方向移动，以设备朝向为中心显示星空
- **传感器融合**：加速度计 + 陀螺仪 + 磁力计，平滑方向追踪
- **触摸交互**：双指缩放、点击天体显示详情、拖拽旋转
- **���索功能**：按名称/星座搜索恒星、行星、深空天体
- **设置面板**：GIS 坐标、时间偏移、渲染质量、显示开关

### ⚡ 性能优化

- **LOD 渲染**：远距离天体简化渲染
- **视锥体剔除**：屏幕外天体自动移除
- **对象池复用**：Vector3 等临时对象复用，避免 GC 抖动
- **卫星/行星 Canvas 批处理**：纹理预生成，减少 DOM 操作

### 💾 离线支持

- **完整 PWA**：Service Worker + Cache API
- **首次加载后离线可用**
- **GitHub Pages 部署**

## 技术栈

| 技术                   | 用途                       |
| ---------------------- | -------------------------- |
| Three.js 0.160 (WebGL) | 3D 渲染引擎                |
| VSOP87 / ELP-2000      | 行星/月球位置计算          |
| 自研天文引擎           | 坐标转换 (ICRS→J2000→地平) |
| Vite 6 / esbuild       | 构建工具                   |
| GitHub Pages           | 部署托管                   |

## 项目结构

```
stellarium-mobile/
├── src/
│   ├── astronomy/       # 天文计算引擎
│   │   ├── coords.js    # 坐标转换 (岁差、章动、恒星时)
│   │   ├── planets.js   # VSOP87 行星位置
│   │   ├── moon.js      # ELP-2000 月球位置
│   │   ├── stars.js     # 恒星位置计算
│   │   ├── time.js      # 儒略日、恒星时
│   │   ├── math.js      # 天文数学工具
│   │   └── index.js
│   ├── render/          # Three.js 3D 渲染
│   │   ├── renderer.js  # 场景管理、相机、点击检测
│   │   ├── solarSystem.js  # 太阳、月球、行星渲染
│   │   ├── planetDetails.js # 土星环、木星卫星
│   │   ├── atmosphere.js    # 大气散射着色器
│   │   ├── galaxy.js        # 银河辉光
│   │   ├── meteor.js        # 流星雨
│   │   ├── satellite.js     # 卫星 Canvas 标签
│   │   ├── performance.js   # LOD、视锥体剔除、对象池
│   │   └── index.js
│   ├── sensors/         # 设备传感器
│   │   ├── sensors.js   # 加速度/陀螺/磁力计融合
│   │   └── index.js
│   ├── data/            # 星表数据
│   │   ├── brightStars.js       # 300+ 亮星星表
│   │   ├── constellationData.js # 星座连线数据
│   │   ├── dsoCatalog.js        # 深空天体目录
│   │   ├── extendedStars.js     # 扩展星表
│   │   ├── starCatalog.js       # 星表管理器
│   │   └── index.js
│   ├── search/          # 搜索功能
│   │   └── search.js
│   ├── settings/        # 设置管理
│   │   ├── settings.js
│   │   └── settingsUI.js
│   ├── test/            # 天文引擎测试
│   │   └── astronomy-test.js
│   └── main.js          # 应用入口
├── public/
│   ├── data/            # 静态星表数据
│   ├── textures/        # 纹理资源
│   └── manifest.json    # PWA 配置
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 开发阶段

| 阶段    | 内容                                      | 状态      |
| ------- | ----------------------------------------- | --------- |
| Phase 0 | 项目脚手架与数据准备                      | ✅ 已完成 |
| Phase 1 | 核心天文引擎 (VSOP87, ELP-2000, 坐标转换) | ✅ 已完成 |
| Phase 2 | 数据管理与星表加载                        | ✅ 已完成 |
| Phase 3 | Three.js 渲染引擎 (星空/太阳系/大气/银河) | ✅ 已完成 |
| Phase 4 | 传感器融合与 AR 交互                      | ✅ 已完成 |
| Phase 5 | UI/UX 与详情系统 (搜索/设置/点击详情)     | ✅ 已完成 |
| Phase 6 | 离线 PWA                                  | ✅ 已完成 |
| Phase 7 | 测试与性能优化                            | ✅ 已完成 |
| Phase 8 | 部署上线                                  | ✅ 已完成 |

## Bug 修复记录

### v0.2.1 — 稳定性提升 (2026-05-24)

1. **brightStars.js** — 统一 300+ 亮星字段名 (`mag→magnitude`, `ci→colorIndex`, `sp→spectralType`, `con→constellation`)
2. **sensors.js** — `Math.copySign()` 不存在，改用三元表达式
3. **solarSystem.js** — `MeshBasicMaterial` 上无效 `emissive` 属性移除
4. **planetDetails.js + main.js** — 木星卫星/土星环未创建 → init 中创建 + 位置同步
5. **solarSystem.js + satellite.js** — `ctx.roundRect()` 兼容性 → quadraticCurve fallback
6. **performance.js** — 每帧 `new Vector3` × 9000+ 次 → 复用 `_pos` 实例
7. **main.js** — `toggleSensor()` 未 await → async + 失败回退 UI 状态
8. **renderer.js + main.js** — 点击只检测深空天体 → 新增行星点击 + `_showPlanetInfo()` 弹窗
9. **meteor.js** — `meteor.trail` 死代码移除
10. **atmosphere.js** — 天顶变暗 `intensity` 无 clamp → `Math.min(1.0, ...)`

## 在线体验

🔗 [https://aurora-serendipity.github.io/stellarium-mobile/](https://aurora-serendipity.github.io/stellarium-mobile/)

## 许可证

MIT License
