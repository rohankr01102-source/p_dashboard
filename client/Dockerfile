FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for Docker HEALTHCHECK
RUN apk add --no-cache curl

# Copy only what's needed for the production server
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Run as non-root user for security
USER node

EXPOSE 3000
HEALTHCHECK --interval=20s --timeout=8s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
