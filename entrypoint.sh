#!/usr/bin/env bash
set -e

echo "🌱 Running Drizzle migrations…"
# Запускаем миграции через npm скрипт
npm run migrate:up

echo "🚀 Starting application…"
exec npm run start:prod
