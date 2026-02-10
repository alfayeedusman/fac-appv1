# Fayeed Auto Care - Production Dockerfile
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application with proper structure
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/database ./database
COPY --from=builder --chown=nextjs:nodejs /app/server/database ./server/database
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Verify the dist structure
RUN ls -la /app/dist/ 2>/dev/null || echo "dist directory not found"
RUN ls -la /app/dist/spa 2>/dev/null || echo "dist/spa not found"
RUN ls -la /app/dist/server 2>/dev/null || echo "dist/server not found"

# Create necessary directories
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

# Make entrypoint script executable
RUN chmod +x /app/scripts/docker-entrypoint.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with entrypoint that handles migrations
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "scripts/docker-entrypoint.sh"]
