# Preserve workspace source and dependencies: SSR output has external imports.
FROM oven/bun:1.3.3 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
ARG BRAND
ARG VITE_SERVER_URL
ARG VITE_ENABLE_POLAR=false
ARG VITE_OWNER_SETUP_CHECK=false
ARG AUTH_SESSION_COOKIE_NAME=better-auth.session_token
RUN test -n "$BRAND" && test -n "$VITE_SERVER_URL"
ENV BRAND=$BRAND VITE_SERVER_URL=$VITE_SERVER_URL \
    VITE_ENABLE_POLAR=$VITE_ENABLE_POLAR VITE_OWNER_SETUP_CHECK=$VITE_OWNER_SETUP_CHECK \
    AUTH_SESSION_COOKIE_NAME=$AUTH_SESSION_COOKIE_NAME
RUN bun run --cwd apps/web build

FROM oven/bun:1.3.3 AS runtime
WORKDIR /app
COPY --from=build --chown=bun:bun /app /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
USER bun
EXPOSE 3001
CMD ["bun", "run", "--cwd", "apps/web", "start"]
