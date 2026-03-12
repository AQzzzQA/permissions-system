#!/bin/sh

# 进入后端目录
cd /app

# 运行迁移脚本
npx ts-node src/database/migrate.ts
