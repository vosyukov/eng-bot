# 1) Сборка и компиляция приложения
FROM denoland/deno:2.3.5 AS builder

WORKDIR /app

# Копируем весь проект
COPY . .

# Устанавливаем зависимости (если нужно) и компилируем в нативный бинарник
RUN deno install
RUN deno run build

# 2) Финальный имидж — тот же Deno для выполнения скрипта миграций и бинаря
FROM denoland/deno:2.3.5

# Пользователь deno уже существует в официальном образе Deno
# Просто переключаемся на него
USER deno

WORKDIR /app



# Копируем бинарь и статические файлы
COPY --from=builder /app/app /app/app
COPY --from=builder /app/src/static/p.txt /app/src/static/p.txt
COPY --from=builder /app/migrations /app/migrations
COPY --from=builder /app/deno.json /app/deno.json
COPY --from=builder /app/drizzle.config.ts /app/drizzle.config.ts
COPY --from=builder /app/package.json /app/package.json





# Копируем скрипт запуска
COPY entrypoint.sh /entrypoint.sh



# Переключаемся на root для изменения прав
USER root
RUN chmod +x /entrypoint.sh
RUN deno install
# Переключаемся на пользователя deno
USER deno

# Запускаем entrypoint
ENTRYPOINT ["/entrypoint.sh"]
