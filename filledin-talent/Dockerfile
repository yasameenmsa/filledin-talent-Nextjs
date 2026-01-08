# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci || npm install
RUN npm install express@4 --save

# ---------- builder ----------
FROM node:20-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG MONGODB_URI
ARG MONGODB_DB
ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB=$MONGODB_DB
RUN npm run build

# ---------- runner ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000

# Copy necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js

# We still copy public here to populate the image layer, 
# but at runtime, the volume mount in docker-compose will hide this.
COPY --from=builder /app/public ./public

# Clean up
RUN npm prune --omit=dev && npm cache clean --force

CMD ["node", "server.js"]
