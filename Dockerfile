FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy server files
COPY server.ts tsconfig.server.json ./

# Build server
RUN pnpm run server:build

# Remove build dependencies (optional, keeps image smaller)
# RUN pnpm prune --production

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
