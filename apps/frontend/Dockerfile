FROM oven/bun:1-alpine
WORKDIR /app

COPY . .
RUN bun install

EXPOSE 5173
CMD ["bun", "run", "dev:frontend"]
