FROM oven/bun:1.3.13-alpine
WORKDIR /app

COPY . .
RUN bun install

EXPOSE 3000
CMD ["bun", "run", "dev:backend"]