# СТАДИЯ 1: Установка зависимостей
FROM node:20-alpine AS deps
# libc6-compat и openssl нужны для корректной работы Prisma в среде Alpine Linux
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
# npm ci гарантирует установку строго по lock-файлу (быстрее и безопаснее npm install)
RUN npm ci

# СТАДИЯ 2: Сборка приложения
FROM node:20-alpine AS builder
WORKDIR /app
# Копируем уже установленные модули из первой стадии
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Компиляция TypeScript и создание папки /build
RUN npm run build

# СТАДИЯ 3: Финальный легковесный образ (Runner)
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV production

# БЕЗОПАСНОСТЬ: Создаем системного пользователя, чтобы не запускать приложение от root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remix

# Забираем только необходимые файлы, чтобы уменьшить размер образа
COPY --from=builder /app/public ./public
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Права на исполнение скрипта инициализации
RUN chmod +x entrypoint.sh
# Генерация Prisma Client для работы с БД внутри контейнера
RUN npx prisma generate

# Переключаемся на непривилегированного пользователя
USER remix

EXPOSE 5173

# Запуск через кастомный скрипт (миграции + сид + старт сервера)
CMD ["/app/entrypoint.sh"]