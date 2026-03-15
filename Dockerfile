FROM node:lts-trixie-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/execution/package.json packages/execution/
COPY packages/server/package.json packages/server/
COPY packages/worker/package.json packages/worker/
COPY packages/dashboard/package.json packages/dashboard/
COPY packages/cli/package.json packages/cli/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app /app
COPY . .
RUN pnpm --filter @codeforce/dashboard build
RUN pnpm --filter @codeforce/server build
RUN pnpm --filter @codeforce/worker build

FROM base AS production
WORKDIR /app
COPY --chown=node:node --from=build /app /app
RUN mkdir -p /codeforge \
  && chown node:node /codeforge

ENV NODE_ENV=production \
  HOST=0.0.0.0 \
  PORT=3100

VOLUME ["/codeforge"]
EXPOSE 3100

USER node
CMD ["node", "--import", "tsx/esm", "packages/server/src/index.ts"]
