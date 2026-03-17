FROM node:18-alpine

WORKDIR /app

# 安装依赖和curl
COPY package*.json ./
RUN npm install --production && apk add --no-cache curl

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 8001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# 启动应用
CMD ["npm", "start"]
