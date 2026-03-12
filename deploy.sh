#!/bin/bash

echo "🚀 OpenClaw 权限控制系统 - 快速部署脚本"
echo "========================================"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 检查端口占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    fi
    return 0
}

# 检查并停止占用端口的进程
if ! check_port 3001; then
    echo "⚠️  端口 3001 被占用，停止旧容器..."
    docker stop openclaw-permissions-backend 2>/dev/null || true
    docker rm openclaw-permissions-backend 2>/dev/null || true
fi

if ! check_port 3000; then
    echo "⚠️  端口 3000 被占用，停止旧容器..."
    docker stop openclaw-permissions-frontend 2>/dev/null || true
    docker rm openclaw-permissions-frontend 2>/dev/null || true
fi

echo "✅ 端口检查完成"
echo ""

# 创建 .env 文件
if [ ! -f "backend/.env" ]; then
    echo "📝 创建后端 .env 文件..."
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 创建前端 .env 文件..."
    cat > frontend/.env << EOF
VITE_API_BASE_URL=http://localhost:3001/api
EOF
fi

echo "✅ 环境配置文件已创建"
echo ""

# 构建和启动
echo "🔨 构建并启动服务..."
docker-compose up -d --build

echo ""
echo "⏳ 等待服务启动..."
sleep 8

# 检查服务状态
echo ""
echo "📊 服务状态："
docker-compose ps

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 访问地址："
echo "  - 权限管理前端: http://localhost:3000/"
echo "  - 后端 API: http://localhost:3001/api/"
echo ""
echo "🔑 默认超级管理员账户："
echo "  - 邮箱: admin@openclaw.ai"
echo "  - 密码: SuperAdmin123!"
echo ""
echo "📚 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
echo "🔄 重启服务: docker-compose restart"
echo ""
