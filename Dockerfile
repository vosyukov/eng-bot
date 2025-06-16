# 1) Сборка и компиляция приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь проект
COPY . .

# Компилируем приложение
RUN npm run build

# 2) Финальный имидж для выполнения приложения
FROM node:20-alpine

# Устанавливаем bash
RUN apk add --no-cache bash

# Создаем пользователя node
USER node

WORKDIR /app

# Копируем собранное приложение и необходимые файлы
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/migrations /app/migrations
COPY --from=builder /app/drizzle.config.ts /app/drizzle.config.ts
COPY --from=builder /app/package.json /app/package.json

# Копируем скрипт запуска
COPY entrypoint.sh /entrypoint.sh

# Переключаемся на root для изменения прав
USER root
RUN chmod +x /entrypoint.sh

# Переключаемся на пользователя node
USER node

# Запускаем entrypoint
ENTRYPOINT ["/entrypoint.sh"]
