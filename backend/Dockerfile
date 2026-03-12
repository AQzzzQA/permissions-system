FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy source code (including compiled files)
COPY . .

EXPOSE 3001

CMD ["npm", "start"]
