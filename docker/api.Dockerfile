FROM oven/bun:1.3.3 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
# Generation needs a URL for config parsing, but never connects or migrates.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build bun run --cwd packages/db db:generate
RUN bun run --cwd apps/server build

FROM oven/bun:1.3.3 AS runtime
WORKDIR /app
COPY --from=build --chown=bun:bun /app /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
USER bun
EXPOSE 3000
CMD ["bun", "run", "--cwd", "apps/server", "start"]
