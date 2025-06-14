#!/usr/bin/env bash
set -e

echo "🌱 Running Drizzle migrations…"
# Здесь вызываем drizzle-kit migrate через Deno без установки npm:
deno task migrate:up

echo "🚀 Starting application…"
exec /app/app
