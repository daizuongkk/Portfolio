FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY server.ts tsconfig.json ./

# Build server
RUN npm run server:build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "run", "server:start"]
