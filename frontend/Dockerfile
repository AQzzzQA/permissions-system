FROM node:18-alpine

# Build argument for API base URL
ARG VITE_API_BASE_URL=/admin/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Install serve to serve the built files
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000", "--no-clipboard"]
