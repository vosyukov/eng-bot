# 1) Сборка зависимостей
FROM node:20-alpine AS deps

WORKDIR /app

# Копируем только файлы, необходимые для установки зависимостей
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies)
RUN npm ci

# 2) Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Копируем только исходный код и файлы конфигурации
COPY tsconfig*.json ./
COPY src/ ./src/


# Компилируем приложение
RUN npm run build

# 3) Финальный имидж для выполнения приложения
FROM node:20-alpine AS runner

# Устанавливаем bash
RUN apk add --no-cache bash && \
    # Создаем директорию приложения и назначаем владельца
    mkdir -p /app && \
    chown -R node:node /app

# Переключаемся на пользователя node
USER node

WORKDIR /app

# Копируем package*.json для установки только production зависимостей
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем собранное приложение и необходимые файлы
COPY --from=builder --chown=node:node /app/dist ./dist

# Копируем и делаем исполняемым скрипт запуска
COPY --chown=node:node entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Запускаем entrypoint
ENTRYPOINT ["/entrypoint.sh"]
