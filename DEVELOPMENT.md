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
npm run build
```

## 同步工作流

### 方式一：使用同步脚本（推荐）

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
git pull origin main

# 提交更改
git add .
git commit -m "描述你的更改"
git push origin main
```

## 项目结构

```
stellarium-mobile/
├── src/
│   ├── astronomy/      # 天文计算引擎
│   ├── render/         # Three.js 渲染
│   ├── sensors/        # 设备传感器
│   ├── ui/             # 界面组件
│   ├── data/           # 数据管理
│   ├── utils/          # 工具函数
│   └── main.js         # 入口文件
├── public/
│   ├── data/           # 星表数据文件
│   ├── textures/       # 纹理资源
│   └── manifest.json   # PWA 配置
├── tools/              # 数据预处理脚本
├── index.html
├── package.json
└── vite.config.js
```

## 自动部署

每次推送到 `main` 分支时，GitHub Actions 会自动：
1. 构建项目
2. 部署到 `gh-pages` 分支
3. 更新 GitHub Pages 站点

部署状态可在仓库的 Actions 标签页查看。

## 定时同步

GitHub Actions 每小时会自动检查远程更新并同步。
