FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Create skillhub wrapper script that uses npx skillhub (correct package name)
RUN echo "#!/bin/sh" > /usr/local/bin/skillhub && \
    echo "npx skillhub \"\$@\"" >> /usr/local/bin/skillhub && \
    chmod +x /usr/local/bin/skillhub && \
    echo "#!/bin/sh" > /usr/local/bin/clawhub && \
    echo "npx clawhub \"\$@\"" >> /usr/local/bin/clawhub && \
    chmod +x /usr/local/bin/clawhub

# Copy source code (including compiled files)
COPY . .

EXPOSE 3001

CMD ["npm", "start"]
