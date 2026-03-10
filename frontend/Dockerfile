# =============================================================================
# PRODFLOW AI - FRONTEND DOCKERFILE (Multi-stage build)
# =============================================================================

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx
RUN adduser -S prodflow -u 1001 -G nginx

# Change ownership
RUN chown -R prodflow:nginx /usr/share/nginx/html
RUN chown -R prodflow:nginx /var/cache/nginx
RUN chown -R prodflow:nginx /var/log/nginx
RUN chown -R prodflow:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R prodflow:nginx /var/run/nginx.pid

USER prodflow

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]