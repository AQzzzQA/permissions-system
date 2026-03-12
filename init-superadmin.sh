#!/bin/bash

echo "🚀 初始化超级管理员"
echo "===================="

BACKEND_URL="http://127.0.0.1:3001"

# 调用初始化接口
echo "正在初始化超级管理员..."
curl -X POST "$BACKEND_URL/api/init-superadmin" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  2>&1 | jq .

echo ""
echo "✅ 初始化完成！"
echo ""
echo "默认账户信息："
echo "  邮箱: admin@openclaw.ai"
echo "  密码: SuperAdmin123!"
