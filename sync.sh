#!/data/data/com.termux/files/usr/bin/bash
# Stellarium Mobile - 本地同步脚本
# 用法: ./sync.sh [push|pull|status]

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 远程仓库配置
REMOTE_URL="https://github.com/Aurora-Serendipity/stellarium-mobile.git"

echo -e "${GREEN}🌟 Stellarium Mobile 同步工具${NC}"
echo "=============================="

case "${1:-status}" in
  push)
    echo -e "${YELLOW}⬆️  推送本地更改到远程...${NC}"
    git add -A
    echo "已暂存所有更改"
    read -p "输入提交信息: " msg
    if [ -z "$msg" ]; then
      msg="update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    git commit -m "$msg" || echo "没有需要提交的更改"
    git push origin master && echo -e "${GREEN}✅ 推送成功${NC}" || echo -e "${RED}❌ 推送失败${NC}"
    ;;
    
  pull)
    echo -e "${YELLOW}⬇️  拉取远程更新...${NC}"
    git fetch origin
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/master 2>/dev/null || echo "none")
    
    if [ "$LOCAL" != "$REMOTE" ]; then
      echo "发现远程更新，正在合并..."
      git pull origin master --rebase && echo -e "${GREEN}✅ 同步成功${NC}" || echo -e "${RED}❌ 同步失败，请手动解决冲突${NC}"
    else
      echo -e "${GREEN}✅ 本地已是最新${NC}"
    fi
    ;;
    
  status)
    echo -e "${YELLOW}📊 仓库状态${NC}"
    echo "------------------------------"
    git status --short
    echo "------------------------------"
    
    # 检查远程更新
    git fetch origin 2>/dev/null
    LOCAL=$(git rev-parse HEAD 2>/dev/null || echo "none")
    REMOTE=$(git rev-parse origin/master 2>/dev/null || echo "none")
    
    if [ "$LOCAL" != "$REMOTE" ]; then
      echo -e "${YELLOW}⚠️  远程有更新，运行 './sync.sh pull' 同步${NC}"
    else
      echo -e "${GREEN}✅ 与远程同步${NC}"
    fi
    ;;
    
  *)
    echo "用法: ./sync.sh [push|pull|status]"
    echo "  push   - 推送本地更改到远程"
    echo "  pull   - 拉取远程更新到本地"
    echo "  status - 查看仓库状态"
    ;;
esac
