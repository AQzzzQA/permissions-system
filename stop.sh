#!/bin/bash

echo "🛑 停止 OpenClaw 权限控制系统"
echo "================================"

docker-compose down

echo "✅ 服务已停止"
echo ""
echo "🧹 清理数据（可选）："
echo "  docker-compose down -v  # 删除数据卷"
echo ""
