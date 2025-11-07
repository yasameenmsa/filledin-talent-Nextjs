## Multi-stage Dockerfile for Next.js SSR with Express
## Uses Node 20 slim to avoid sharp/alpine issues

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000

# Copy production artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/server.js ./server.js

# Install only production deps in final image
RUN npm ci --omit=dev && npm cache clean --force

CMD ["node", "server.js"]