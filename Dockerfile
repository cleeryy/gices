# syntax = docker/dockerfile:1

# Base stage
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencies stage
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
COPY prisma/ ./prisma/


# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create .next directory with proper permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Copy Prisma files (AJOUT IMPORTANT)
COPY --from=build /app/prisma ./prisma/
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
