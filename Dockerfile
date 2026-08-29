# syntax=docker/dockerfile:1
FROM node:26-alpine AS base
WORKDIR /repo

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/widget/package.json packages/widget/package.json
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production

# Next.js standalone output already contains a pruned node_modules, so the
# runtime image doesn't need a full npm install. Its internal layout mirrors
# the monorepo root (apps/web/server.js, node_modules/, ...).
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
COPY --from=build /repo/apps/web/prisma ./apps/web/prisma

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
